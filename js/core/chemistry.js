// חוקי ה"ידיים": כמה קשרים לכל אטום, האם הכול מחובר, ונוסחה.
// עובד על "גרף": { symbols: ["C","H",…], bonds: [[i, j, order], …] }

import { ATOMS } from "../data/atoms.js";

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";

export function toSubscript(formula) {
  return formula.replace(/\d/g, (d) => SUBSCRIPTS[d]);
}

/** מצב הלוח (אטומים עם id) → גרף עם אינדקסים */
export function boardToGraph(atoms, bonds) {
  const index = new Map(atoms.map((a, i) => [a.id, i]));
  return {
    symbols: atoms.map((a) => a.symbol),
    bonds: bonds.map((b) => [index.get(b.a), index.get(b.b), b.order]),
  };
}

export function handsUsed(graph) {
  const used = graph.symbols.map(() => 0);
  graph.bonds.forEach(([i, j, order]) => {
    used[i] += order;
    used[j] += order;
  });
  return used;
}

export function freeHands(graph) {
  const used = handsUsed(graph);
  return graph.symbols.map((s, i) => ATOMS[s].hands - used[i]);
}

export function componentCount(graph) {
  const n = graph.symbols.length;
  const parent = [...Array(n).keys()];
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  graph.bonds.forEach(([i, j]) => { parent[find(i)] = find(j); });
  return new Set(parent.map((_, i) => find(i))).size;
}

/** נוסחה לפי שיטת Hill: C ואז H ואז לפי א״ב. בלי פחמן: הכול לפי א״ב. */
export function hillFormula(symbols) {
  const counts = {};
  symbols.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
  const keys = Object.keys(counts).sort();
  const order = counts.C
    ? ["C", ...(counts.H ? ["H"] : []), ...keys.filter((k) => k !== "C" && k !== "H")]
    : keys;
  return order.map((s) => s + (counts[s] > 1 ? counts[s] : "")).join("");
}

/**
 * דו"ח על המבנה:
 *  complete  – יותר מאטום אחד, הכול מחובר וכל הידיים תפוסות
 *  open      – אינדקסים של אטומים עם ידיים פנויות
 *  pieces    – כמה חלקים נפרדים יש על הלוח
 */
export function analyze(graph) {
  const free = freeHands(graph);
  const open = free.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0);
  const over = free.map((f, i) => (f < 0 ? i : -1)).filter((i) => i >= 0);
  const pieces = graph.symbols.length ? componentCount(graph) : 0;
  const complete =
    graph.symbols.length > 1 && pieces === 1 && open.length === 0 && over.length === 0;
  return { complete, open, over, pieces, free, formula: hillFormula(graph.symbols) };
}
