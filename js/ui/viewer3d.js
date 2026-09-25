// תצוגת תלת־ממד (Three.js r124 מקומי, גלובלי THREE).
// שתי תצוגות: כדור־מקל ומלא. משחרר גאומטריות בכל החלפה, ועוצר את הלולאה כשלא רואים אותו.

import { ATOMS } from "../data/atoms.js";
import { embed3d } from "../core/geometry3d.js";
import { readPref, writePref } from "../core/progress.js";
import { reducedMotion } from "./dom.js";

const viewerEl = document.getElementById("viewer");
const canvas = document.getElementById("viewer-canvas");
const emptyEl = document.getElementById("viewer-empty");
const modeButtons = viewerEl.querySelectorAll("[data-mode]");

const STICK_SCALE = 0.32;
const FILL_SCALE = 0.95;
const BOND_RADIUS = 0.11;

let three = null;         // { renderer, scene, camera, controls, group }
let current = null;       // הגרף המוצג
let mode = readPref("mb.view3d", "stick") === "fill" ? "fill" : "stick";
let visible = true;
let running = false;
const materials = new Map();

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

function init() {
  if (three || !window.THREE || !webglAvailable()) return !!three;
  const THREE = window.THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa7b8, 0.8));
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(-4, 6, 8);
  camera.add(key);
  scene.add(camera);
  const group = new THREE.Group();
  scene.add(group);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.autoRotateSpeed = 1.6;
  three = { THREE, renderer, scene, camera, controls, group };
  materials.set("bond", new THREE.MeshStandardMaterial({ color: 0x8a96a3, roughness: 0.5 }));

  new ResizeObserver(resize).observe(viewerEl);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop(); }).observe(viewerEl);
  document.addEventListener("visibilitychange", loop);
  resize();
  return true;
}

function resize() {
  if (!three) return;
  const w = viewerEl.clientWidth || 300;
  const h = viewerEl.clientHeight || 260;
  three.renderer.setSize(w, h, false);
  three.camera.aspect = w / h;
  three.camera.updateProjectionMatrix();
}

function loop() {
  if (!three || running || !visible || document.hidden || !current) return;
  running = true;
  const tick = () => {
    if (!visible || document.hidden || !current) { running = false; return; }
    three.controls.update();
    three.renderer.render(three.scene, three.camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function material(symbol) {
  if (!materials.has(symbol)) {
    const { THREE } = three;
    materials.set(symbol, new THREE.MeshStandardMaterial({ color: ATOMS[symbol].color, roughness: 0.35, metalness: 0.05 }));
  }
  return materials.get(symbol);
}

function disposeGroup() {
  three.group.children.slice().forEach((mesh) => {
    mesh.geometry.dispose();
    three.group.remove(mesh);
  });
}

function bondMeshes(p, q, order, perp) {
  const { THREE } = three;
  const bondMat = materials.get("bond");
  const dir = new THREE.Vector3().subVectors(q, p);
  const len = dir.length();
  const meshes = [];
  for (let k = 0; k < order; k++) {
    const off = perp ? perp.clone().multiplyScalar((k - (order - 1) / 2) * 0.26) : new THREE.Vector3();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, len, 14), bondMat);
    mesh.position.copy(p).add(q).multiplyScalar(0.5).add(off);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    meshes.push(mesh);
  }
  return meshes;
}

/** כיוון להפרדת קווי קשר כפול: במישור של השכנים (כמו בשרטוט כימי) */
function perpendicular(pos, bonds, i, j) {
  const { THREE } = three;
  const axis = new THREE.Vector3().subVectors(pos[j], pos[i]).normalize();
  const other = bonds
    .map(([a, b]) => (a === i && b !== j ? b : b === i && a !== j ? a : a === j && b !== i ? b : b === j && a !== i ? a : -1))
    .find((k) => k >= 0);
  const ref = other >= 0 ? new THREE.Vector3().subVectors(pos[other], pos[i]) : new THREE.Vector3(0, 0, 1);
  let perp = ref.sub(axis.clone().multiplyScalar(ref.dot(axis)));
  if (perp.lengthSq() < 1e-4) perp = new THREE.Vector3(0, 1, 0).cross(axis);
  if (perp.lengthSq() < 1e-4) perp = new THREE.Vector3(1, 0, 0).cross(axis);
  return perp.normalize();
}

function build() {
  const { THREE, group, camera, controls } = three;
  disposeGroup();
  const pos = embed3d(current).map(([x, y, z]) => new THREE.Vector3(x, y, z));
  current.symbols.forEach((s, i) => {
    const r = mode === "fill" ? ATOMS[s].vdw * FILL_SCALE : Math.max(0.28, ATOMS[s].vdw * STICK_SCALE);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), material(s));
    mesh.position.copy(pos[i]);
    group.add(mesh);
  });
  if (mode === "stick") {
    current.bonds.forEach(([i, j, order]) => {
      const perp = order > 1 ? perpendicular(pos, current.bonds, i, j) : null;
      bondMeshes(pos[i], pos[j], order, perp).forEach((m) => group.add(m));
    });
  }
  const reach = Math.max(...current.symbols.map((sym, i) => pos[i].length() + ATOMS[sym].vdw * (mode === "fill" ? FILL_SCALE : STICK_SCALE)));
  const fit = Math.max(reach, 1.2) / Math.sin((camera.fov * Math.PI) / 360);
  const dist = fit * 1.7 * Math.max(1, 1 / camera.aspect);
  camera.position.set(0, dist * 0.12, dist);
  controls.target.set(0, 0, 0);
  controls.autoRotate = !reducedMotion();
  controls.update();
}

export function show(graph) {
  current = graph;
  viewerEl.classList.remove("is-empty");
  if (!init()) {
    emptyEl.textContent = "התצוגה התלת־ממדית לא נתמכת במכשיר הזה";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  canvas.hidden = false;
  resize();
  build();
  loop();
}

export function clear() {
  current = null;
  viewerEl.classList.add("is-empty");
  canvas.hidden = true;
  emptyEl.hidden = false;
  if (three) disposeGroup();
}

export function initViewer() {
  modeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.mode === mode));
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      writePref("mb.view3d", mode);
      modeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (current && three) build();
    });
  });
  clear();
}
