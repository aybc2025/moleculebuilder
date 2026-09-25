// פריסה על הלוח: מטילים את המבנה התלת־ממדי על המישור ש"רואה" אותו הכי טוב (PCA),
// מתאימים לגודל הלוח, ומרחיקים אטומים שנפלו אחד על השני.

import { embed3d } from "./geometry3d.js";

function covariance(points) {
  const m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  points.forEach((p) => {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) m[a][b] += p[a] * p[b];
  });
  return m;
}

function mulVec(m, v) {
  return m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
}

function normalize(v) {
  const len = Math.hypot(...v) || 1;
  return v.map((x) => x / len);
}

/** שני הכיוונים העיקריים (power iteration). מספיק ל־3×3. */
function principalAxes(points) {
  const m = covariance(points);
  let a = normalize([1, 0.31, 0.17]);
  for (let i = 0; i < 60; i++) a = normalize(mulVec(m, a));
  const lambda = mulVec(m, a).reduce((s, x, k) => s + x * a[k], 0);
  const deflated = m.map((row, r) => row.map((x, c) => x - lambda * a[r] * a[c]));
  let b = normalize([0.13, 1, 0.29]);
  for (let i = 0; i < 60; i++) {
    b = mulVec(deflated, b);
    const dot = b.reduce((s, x, k) => s + x * a[k], 0);
    b = normalize(b.map((x, k) => x - dot * a[k]));
  }
  return [a, b];
}

function spreadApart(pts, radii, bondsSet, passes = 60) {
  for (let p = 0; p < passes; p++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const min = radii[i] + radii[j] + (bondsSet.has(`${i},${j}`) ? 4 : 10);
        const dx = pts[j][0] - pts[i][0];
        const dy = pts[j][1] - pts[i][1];
        const d = Math.hypot(dx, dy) || 0.01;
        if (d >= min) continue;
        const push = (min - d) / 2 / d;
        pts[i][0] -= dx * push; pts[i][1] -= dy * push;
        pts[j][0] += dx * push; pts[j][1] += dy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

/**
 * graph  – { symbols, bonds }
 * box    – { width, height, padding }
 * radius – (symbol) => רדיוס האטום בפיקסלים
 * מחזיר מערך [x, y] בפיקסלים.
 */
export function layout2d(graph, box, radius) {
  const p3 = embed3d(graph);
  const n = p3.length;
  const flat = n > 2 ? project(p3) : lineUp(p3);

  const xs = flat.map((p) => p[0]);
  const ys = flat.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) || 1;
  const h = Math.max(...ys) - Math.min(...ys) || 1;
  const pad = box.padding ?? 40;
  const scale = Math.min((box.width - pad * 2) / w, (box.height - pad * 2) / h, 62);

  const radii = graph.symbols.map(radius);
  const pts = flat.map(([x, y]) => [x * scale, y * scale]);
  const bondsSet = new Set(graph.bonds.map(([i, j]) => (i < j ? `${i},${j}` : `${j},${i}`)));
  spreadApart(pts, radii, bondsSet);

  // מרכוז בתוך הלוח
  const cx = (Math.max(...pts.map((p) => p[0])) + Math.min(...pts.map((p) => p[0]))) / 2;
  const cy = (Math.max(...pts.map((p) => p[1])) + Math.min(...pts.map((p) => p[1]))) / 2;
  return pts.map(([x, y], i) => [
    clamp(x - cx + box.width / 2, radii[i], box.width - radii[i]),
    clamp(y - cy + box.height / 2, radii[i], box.height - radii[i]),
  ]);
}

function project(p3) {
  const [ax, ay] = principalAxes(p3);
  const dot = (p, a) => p[0] * a[0] + p[1] * a[1] + p[2] * a[2];
  return p3.map((p) => [dot(p, ax), dot(p, ay)]);
}

/** אטום אחד או שניים: פשוט בשורה */
function lineUp(p3) {
  if (p3.length === 1) return [[0, 0]];
  const d = Math.hypot(...p3[0].map((v, k) => v - p3[1][k]));
  return [[-d / 2, 0], [d / 2, 0]];
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
