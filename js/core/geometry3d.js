// גאומטריה תלת־ממדית מכל גרף, לפי כללי VSEPR פשוטים:
// אורכי קשר מרדיוסים קוולנטיים, זוויות לפי מספר "כיווני אלקטרונים" סביב כל אטום,
// מישוריות סביב קשר כפול, ודחייה בין אטומים שאינם קשורים.
// דטרמיניסטי: אותו גרף תמיד מקבל אותו מבנה.

import { ATOMS } from "../data/atoms.js";

const ORDER_SHRINK = { 1: 1, 2: 0.87, 3: 0.78 };
const DEG = Math.PI / 180;

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function bondLength(a, b, order) {
  return (ATOMS[a].covalent + ATOMS[b].covalent) * ORDER_SHRINK[order];
}

/** הזווית האידיאלית סביב אטום מרכזי */
function idealAngle(symbol, degree) {
  const lp = ATOMS[symbol].lonePairs;
  const steric = degree + lp;
  if (steric >= 4) {
    if (lp === 0) return 109.47;
    if (symbol === "S") return 92;
    return lp === 1 ? 107 : 104.5;
  }
  return steric === 3 ? 120 : 180;
}

/** כל האילוצים: [i, j, targetDistance, weight] */
function constraints(graph) {
  const { symbols, bonds } = graph;
  const n = symbols.length;
  const nbrs = symbols.map(() => []);
  const dist = new Map();
  const key = (i, j) => (i < j ? `${i},${j}` : `${j},${i}`);
  const list = [];

  bonds.forEach(([i, j, o]) => {
    const d = bondLength(symbols[i], symbols[j], o);
    nbrs[i].push([j, d]);
    nbrs[j].push([i, d]);
    dist.set(key(i, j), d);
    list.push([i, j, d, 1]);
  });

  for (let c = 0; c < n; c++) {
    const theta = idealAngle(symbols[c], nbrs[c].length) * DEG;
    for (let p = 0; p < nbrs[c].length; p++) {
      for (let q = p + 1; q < nbrs[c].length; q++) {
        const [i, a] = nbrs[c][p];
        const [j, b] = nbrs[c][q];
        if (dist.has(key(i, j))) continue;
        const d = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(theta));
        dist.set(key(i, j), d);
        list.push([i, j, d, 0.6]);
      }
    }
  }
  return { list, dist, key, n };
}

/**
 * קשר בין שני אטומים "שטוחים" (שיש להם קשר כפול, כמו באתילן ובבנזן):
 * השכנים משני הצדדים באותו מישור (cis או trans, מה שקרוב יותר)
 */
function planarPairs(graph) {
  const pairs = [];
  const nbrs = graph.symbols.map(() => []);
  const flat = graph.symbols.map(() => false);
  graph.bonds.forEach(([i, j, o]) => {
    nbrs[i].push(j); nbrs[j].push(i);
    if (o === 2) { flat[i] = true; flat[j] = true; }
  });
  graph.bonds.forEach(([a, b]) => {
    if (!flat[a] || !flat[b] || nbrs[a].length !== 3 && nbrs[b].length !== 3) return;
    nbrs[a].filter((x) => x !== b).forEach((x) => {
      nbrs[b].filter((y) => y !== a).forEach((y) => pairs.push([x, a, b, y]));
    });
  });
  return pairs;
}

function planarTargets(pos, dist, key, [x, a, b, y]) {
  const dxa = dist.get(key(x, a)), dab = dist.get(key(a, b)), dby = dist.get(key(b, y));
  const ang1 = 120 * DEG, ang2 = 120 * DEG;
  // מיקום דו־ממדי של ארבעת האטומים במצב cis ו־trans
  const X = [dxa * Math.cos(ang1), dxa * Math.sin(ang1)];
  const Ycis = [dab + dby * Math.cos(Math.PI - ang2), dby * Math.sin(Math.PI - ang2)];
  const Ytrans = [Ycis[0], -Ycis[1]];
  const cis = Math.hypot(X[0] - Ycis[0], X[1] - Ycis[1]);
  const trans = Math.hypot(X[0] - Ytrans[0], X[1] - Ytrans[1]);
  const now = Math.hypot(...[0, 1, 2].map((k) => pos[x][k] - pos[y][k]));
  return Math.abs(now - cis) < Math.abs(now - trans) ? cis : trans;
}

/** אטומים עם שלושה שכנים ובלי זוגות בודדים (פחמן בקשר כפול) צריכים להיות שטוחים */
function flatCenters(graph) {
  const nbrs = graph.symbols.map(() => []);
  graph.bonds.forEach(([i, j]) => { nbrs[i].push(j); nbrs[j].push(i); });
  return nbrs
    .map((ns, c) => [c, ...ns])
    .filter((row, c) => row.length === 4 && ATOMS[graph.symbols[c]].lonePairs === 0);
}

/** מקרב את המרכז למישור של שלושת שכניו */
function flatten(pos, [c, a, b, d], w) {
  const u = [0, 1, 2].map((k) => pos[b][k] - pos[a][k]);
  const v = [0, 1, 2].map((k) => pos[d][k] - pos[a][k]);
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const len = Math.hypot(...n);
  if (len < 1e-6) return;
  const h = [0, 1, 2].reduce((s, k) => s + (pos[c][k] - pos[a][k]) * n[k], 0) / len;
  for (let k = 0; k < 3; k++) {
    const shift = (n[k] / len) * h * w;
    pos[c][k] -= shift * 0.75;
    pos[a][k] += shift * 0.25;
    pos[b][k] += shift * 0.25;
    pos[d][k] += shift * 0.25;
  }
}

function relax(graph, seed, flatStart) {
  const { list, dist, key, n } = constraints(graph);
  const planar = planarPairs(graph);
  const flats = flatCenters(graph);
  const skip = new Set(planar.map((p) => key(p[0], p[3])));
  const rand = rng(seed);
  const spread = 1.2 * Math.cbrt(n) + 0.5;
  const zScale = flatStart ? 0.15 : 1;
  const pos = graph.symbols.map(() => [1, 1, zScale].map((f) => (rand() - 0.5) * 2 * spread * f));

  const pull = (i, j, target, w) => {
    const d = [0, 1, 2].map((k) => pos[j][k] - pos[i][k]);
    const len = Math.hypot(...d) || 1e-6;
    const f = ((len - target) / len) * 0.5 * w;
    for (let k = 0; k < 3; k++) {
      pos[i][k] += d[k] * f;
      pos[j][k] -= d[k] * f;
    }
  };

  const ITER = 900;
  for (let it = 0; it < ITER; it++) {
    const heat = 1 - it / ITER;
    list.forEach(([i, j, d, w]) => pull(i, j, d, w));
    if (it > ITER * 0.15) {
      planar.forEach((p) => pull(p[0], p[3], planarTargets(pos, dist, key, p), 0.6));
    }
    flats.forEach((f) => flatten(pos, f, 0.5));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (dist.has(key(i, j)) || skip.has(key(i, j))) continue;
        const d = Math.hypot(...[0, 1, 2].map((k) => pos[i][k] - pos[j][k]));
        const min = 2.6;
        if (d < min) pull(i, j, min, 0.08);
      }
    }
    if (heat > 0.6) {
      pos.forEach((p) => { for (let k = 0; k < 3; k++) p[k] += (rand() - 0.5) * 0.05 * heat; });
    }
  }

  let energy = 0;
  list.forEach(([i, j, d, w]) => {
    const now = Math.hypot(...[0, 1, 2].map((k) => pos[i][k] - pos[j][k]));
    energy += w * (now - d) ** 2;
  });
  planar.forEach((p) => {
    const now = Math.hypot(...[0, 1, 2].map((k) => pos[p[0]][k] - pos[p[3]][k]));
    energy += 0.6 * (now - planarTargets(pos, dist, key, p)) ** 2;
  });
  return { pos, energy };
}

function center(pos) {
  const c = [0, 1, 2].map((k) => pos.reduce((s, p) => s + p[k], 0) / pos.length);
  return pos.map((p) => p.map((v, k) => v - c[k]));
}

const cache = new Map();

/** מחזיר מערך של [x,y,z] באנגסטרם, ממורכז סביב 0 */
export function embed3d(graph) {
  const cacheKey = graph.symbols.join(" ") + "|" + graph.bonds.map((b) => b.join(",")).join(" ");
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  if (graph.symbols.length === 1) return [[0, 0, 0]];
  let best = null;
  for (let s = 1; s <= 6; s++) {
    const result = relax(graph, s * 7919, s % 2 === 0);
    if (!best || result.energy < best.energy) best = result;
  }
  const out = center(best.pos);
  cache.set(cacheKey, out);
  return out;
}
