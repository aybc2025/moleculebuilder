// ציור הלוח: אטומים, קשרים ו"חורי ידיים". מאזין ל־store ולא משנה לוגיקה.
// "display" מחזיק את המיקום המוצג – בדרך כלל זהה ל־store, ושונה רק בזמן החלקה.

import * as store from "../core/store.js";
import { ATOMS } from "../data/atoms.js";
import { el, reducedMotion } from "./dom.js";
import { pegAngles } from "./pegs.js";

const SVG = "http://www.w3.org/2000/svg";
const BOND_STYLE = { 1: { gap: 0, width: 7 }, 2: { gap: 5.5, width: 4.5 }, 3: { gap: 7, width: 3.8 } };
const GLIDE_MS = 450;

const boardEl = document.getElementById("board");
const atomLayer = document.getElementById("atom-layer");
const bondLayer = document.getElementById("bond-layer");
const emptyEl = document.getElementById("board-empty");

const nodes = new Map();   // id → element
const display = new Map(); // id → { x, y }
let deleteBtn = null;
let glide = null;

export const boardElement = boardEl;

export function boardSize() {
  return { width: boardEl.clientWidth, height: boardEl.clientHeight };
}

export function nodeFor(id) {
  return nodes.get(id);
}

function createNode(atom) {
  const node = el("button", {
    type: "button",
    class: "ball atom",
    data: { symbol: atom.symbol, id: atom.id },
    "aria-label": ATOMS[atom.symbol].name,
    text: atom.symbol,
  });
  atomLayer.append(node);
  nodes.set(atom.id, node);
  return node;
}

function place(node, { x, y }) {
  node.style.setProperty("--x", `${x}px`);
  node.style.setProperty("--y", `${y}px`);
}

function neighborsOf(id) {
  const { bonds } = store.getState();
  return bonds
    .filter((b) => b.a === id || b.b === id)
    .map((b) => (b.a === id ? b.b : b.a));
}

function drawPegs(atom, node) {
  node.querySelectorAll(".peg").forEach((p) => p.remove());
  const here = display.get(atom.id);
  const angles = neighborsOf(atom.id).map((n) => {
    const there = display.get(n);
    return Math.atan2(there.y - here.y, there.x - here.x);
  });
  pegAngles(angles, store.freeHandsOf(atom.id)).forEach((deg) => {
    const peg = el("span", { class: "peg", "aria-hidden": "true" });
    peg.style.setProperty("--a", `${deg}deg`);
    node.append(peg);
  });
}

function drawBonds() {
  bondLayer.replaceChildren();
  store.getState().bonds.forEach((bond) => {
    const p = display.get(bond.a);
    const q = display.get(bond.b);
    if (!p || !q) return;
    const { gap, width } = BOND_STYLE[bond.order];
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const nx = -(q.y - p.y) / len;
    const ny = (q.x - p.x) / len;
    for (let k = 0; k < bond.order; k++) {
      const off = (k - (bond.order - 1) / 2) * gap * 2;
      const line = document.createElementNS(SVG, "line");
      line.setAttribute("x1", p.x + nx * off);
      line.setAttribute("y1", p.y + ny * off);
      line.setAttribute("x2", q.x + nx * off);
      line.setAttribute("y2", q.y + ny * off);
      line.setAttribute("stroke-width", width);
      bondLayer.append(line);
    }
  });
}

function drawDeleteButton() {
  const { selectedId } = store.getState();
  const pos = selectedId && display.get(selectedId);
  if (!pos) {
    deleteBtn?.remove();
    deleteBtn = null;
    return;
  }
  if (!deleteBtn) {
    deleteBtn = el("button", { type: "button", class: "atom-delete", "data-action": "delete" }, [
      trashIcon(),
      "מחק אטום",
    ]);
  }
  place(deleteBtn, pos);
  atomLayer.append(deleteBtn);
}

function trashIcon() {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  ["M4 7h16", "M6 7l1 13h10l1-13", "M9 7V4h6v3"].forEach((d) => {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    svg.append(path);
  });
  return svg;
}

/** מיקומים בלבד – נקרא בכל פריים של גרירה או החלקה */
export function redrawPositions() {
  const { atoms } = store.getState();
  atoms.forEach((atom) => {
    const node = nodes.get(atom.id);
    if (!node) return;
    place(node, display.get(atom.id));
    drawPegs(atom, node);
  });
  drawBonds();
  drawDeleteButton();
}

/** סנכרון מלא מול ה־store */
export function sync(newId = null) {
  const { atoms, selectedId } = store.getState();
  const alive = new Set(atoms.map((a) => a.id));
  for (const [id, node] of nodes) {
    if (!alive.has(id)) { node.remove(); nodes.delete(id); display.delete(id); }
  }
  atoms.forEach((atom) => {
    const node = nodes.get(atom.id) || createNode(atom);
    if (!glide || !display.has(atom.id)) display.set(atom.id, { x: atom.x, y: atom.y });
    node.classList.toggle("is-selected", atom.id === selectedId);
    node.setAttribute("aria-pressed", atom.id === selectedId ? "true" : "false");
    if (atom.id === newId && !reducedMotion()) {
      node.classList.remove("is-new");
      void node.offsetWidth;
      node.classList.add("is-new");
    }
  });
  emptyEl.hidden = atoms.length > 0;
  redrawPositions();
}

/** החלקה מהמיקום המוצג אל המיקום החדש ב־store (אחרי זיהוי מולקולה) */
export function glideToState() {
  const { atoms } = store.getState();
  if (reducedMotion()) { glide = null; sync(); return; }
  const from = new Map(atoms.map((a) => [a.id, { ...(display.get(a.id) || a) }]));
  const start = performance.now();
  if (glide) cancelAnimationFrame(glide);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const frame = (now) => {
    const t = Math.min(1, (now - start) / GLIDE_MS);
    const k = ease(t);
    atoms.forEach((a) => {
      const f = from.get(a.id);
      display.set(a.id, { x: f.x + (a.x - f.x) * k, y: f.y + (a.y - f.y) * k });
    });
    redrawPositions();
    glide = t < 1 ? requestAnimationFrame(frame) : null;
  };
  glide = requestAnimationFrame(frame);
}

/** גרירה: עדכון ה־store והתצוגה יחד */
export function dragTo(id, x, y) {
  const r = 26;
  const { width, height } = boardSize();
  const cx = Math.max(r, Math.min(width - r, x));
  const cy = Math.max(r, Math.min(height - r, y));
  store.moveAtom(id, cx, cy);
  display.set(id, { x: cx, y: cy });
  redrawPositions();
}

export function flashAtoms(ids, cls, ms) {
  ids.forEach((id) => {
    const node = nodes.get(id);
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), ms);
  });
}

/** אחרי שינוי גודל: מחזירים אטומים שנשארו מחוץ ללוח */
export function keepInside() {
  const { width, height } = boardSize();
  if (!width || !height) return;
  store.getState().atoms.forEach((a) => {
    if (a.x > width - 20 || a.y > height - 20) dragTo(a.id, a.x, a.y);
  });
}
