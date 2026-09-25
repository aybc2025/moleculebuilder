// זיהוי: האם הגרף שנבנה זהה (איזומורפי) לאחת המולקולות המוכרות.
// חיפוש עם חזרה לאחור, מסונן לפי סמל, דרגה וסדרי קשרים. מהיר לגרפים של עד כ־20 אטומים.

import { MOLECULES } from "../data/molecules.js";
import { hillFormula } from "./chemistry.js";

function adjacency(graph) {
  const adj = graph.symbols.map(() => new Map());
  graph.bonds.forEach(([i, j, order]) => {
    adj[i].set(j, order);
    adj[j].set(i, order);
  });
  return adj;
}

function signature(graph, adj, i) {
  const orders = [...adj[i].values()].sort().join("");
  const nbrs = [...adj[i].keys()].map((j) => graph.symbols[j]).sort().join(",");
  return `${graph.symbols[i]}|${orders}|${nbrs}`;
}

/** סדר מעבר BFS שמתחיל באטום הנדיר ביותר, כך שכל אטום חדש נבדק מול שכן שכבר מופה */
function searchOrder(graph, adj, sigs) {
  const freq = {};
  sigs.forEach((s) => { freq[s] = (freq[s] || 0) + 1; });
  const seen = new Set();
  const order = [];
  const starts = [...graph.symbols.keys()].sort((a, b) => freq[sigs[a]] - freq[sigs[b]]);
  for (const start of starts) {
    if (seen.has(start)) continue;
    const queue = [start];
    seen.add(start);
    while (queue.length) {
      const i = queue.shift();
      order.push(i);
      for (const j of adj[i].keys()) {
        if (!seen.has(j)) { seen.add(j); queue.push(j); }
      }
    }
  }
  return order;
}

export function isomorphic(g1, g2) {
  const n = g1.symbols.length;
  if (n !== g2.symbols.length || g1.bonds.length !== g2.bonds.length) return false;
  const adj1 = adjacency(g1);
  const adj2 = adjacency(g2);
  const sig1 = g1.symbols.map((_, i) => signature(g1, adj1, i));
  const sig2 = g2.symbols.map((_, i) => signature(g2, adj2, i));
  if ([...sig1].sort().join(";") !== [...sig2].sort().join(";")) return false;

  const order = searchOrder(g1, adj1, sig1);
  const map = new Array(n).fill(-1);
  const used = new Array(n).fill(false);

  const fits = (i, j) => {
    if (sig1[i] !== sig2[j]) return false;
    for (const [k, order1] of adj1[i]) {
      if (map[k] >= 0 && adj2[j].get(map[k]) !== order1) return false;
    }
    return true;
  };

  const step = (depth) => {
    if (depth === n) return true;
    const i = order[depth];
    for (let j = 0; j < n; j++) {
      if (used[j] || !fits(i, j)) continue;
      map[i] = j; used[j] = true;
      if (step(depth + 1)) return true;
      map[i] = -1; used[j] = false;
    }
    return false;
  };
  return step(0);
}

export function moleculeGraph(mol) {
  return { symbols: mol.atoms, bonds: mol.bonds };
}

/**
 * { kind: "exact", molecule }  – בדיוק מולקולה מוכרת
 * { kind: "isomer", molecule } – אותה נוסחה, מבנה אחר
 * { kind: "new" }              – מולקולה חוקית שלא ברשימה
 */
export function identify(graph) {
  const formula = hillFormula(graph.symbols);
  const sameFormula = MOLECULES.filter((m) => hillFormula(m.atoms) === formula);
  const exact = sameFormula.find((m) => isomorphic(graph, moleculeGraph(m)));
  if (exact) return { kind: "exact", molecule: exact };
  if (sameFormula.length) return { kind: "isomer", molecule: sameFormula[0] };
  return { kind: "new" };
}
