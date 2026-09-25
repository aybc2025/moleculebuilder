// מקור האמת היחיד של הלוח. בלי DOM ובלי אנימציה:
// כל פעולה משנה את המצב וכותבת אירוע { kind, payload, nonce }.
// התצוגה מאזינה לאירועים ומחליטה לבד איך להציג אותם.

import { ATOMS } from "../data/atoms.js";
import { analyze, boardToGraph } from "./chemistry.js";
import { identify } from "./match.js";

const HISTORY_MAX = 50;

const state = {
  atoms: [],        // { id, symbol, x, y }
  bonds: [],        // { id, a, b, order }
  selectedId: null,
  challengeId: null,
  fromDemo: false,  // הלוח הגיע מ"הראה לי" ולא נבנה בידיים
  report: null,     // תוצאת analyze האחרונה
  result: null,     // תוצאת identify כשהמבנה שלם
  event: null,
};

const history = [];
const listeners = new Set();
let nonce = 0;
let nextId = 1;

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(kind, payload = {}) {
  state.event = { kind, payload, nonce: ++nonce };
  listeners.forEach((fn) => fn(state, state.event));
}

function snapshot() {
  history.push({
    atoms: state.atoms.map((a) => ({ ...a })),
    bonds: state.bonds.map((b) => ({ ...b })),
    fromDemo: state.fromDemo,
  });
  if (history.length > HISTORY_MAX) history.shift();
}

export const canUndo = () => history.length > 0;
export const graph = () => boardToGraph(state.atoms, state.bonds);
export const findAtom = (id) => state.atoms.find((a) => a.id === id);

export function freeHandsOf(id) {
  const atom = findAtom(id);
  const used = state.bonds
    .filter((b) => b.a === id || b.b === id)
    .reduce((s, b) => s + b.order, 0);
  return ATOMS[atom.symbol].hands - used;
}

function findBond(a, b) {
  return state.bonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
}

/** בודק את המבנה אחרי כל שינוי מבני, ומודיע כשזוהתה מולקולה שלמה */
function evaluate() {
  const g = graph();
  state.report = analyze(g);
  const before = state.result;
  state.result = state.report.complete ? identify(g) : null;
  emit("changed");
  if (state.result && !before) {
    const solved =
      !state.fromDemo &&
      state.result.kind === "exact" &&
      state.result.molecule.id === state.challengeId;
    if (solved) state.challengeId = null;
    emit("recognized", { result: state.result, formula: state.report.formula, fromDemo: state.fromDemo, solved });
  }
}

export function addAtom(symbol, x, y, bondTo = null) {
  snapshot();
  state.fromDemo = false;
  const atom = { id: `a${nextId++}`, symbol, x, y };
  state.atoms.push(atom);
  let bonded = false;
  if (bondTo && findAtom(bondTo) && freeHandsOf(bondTo) > 0) {
    state.bonds.push({ id: `b${nextId++}`, a: bondTo, b: atom.id, order: 1 });
    bonded = true;
    if (freeHandsOf(bondTo) === 0) state.selectedId = null;
  }
  emit("atomAdded", { id: atom.id, bonded });
  evaluate();
  return atom;
}

/** תזוזה בזמן גרירה: בלי היסטוריה ובלי בדיקה מחדש */
export function moveAtom(id, x, y) {
  const atom = findAtom(id);
  if (!atom) return;
  atom.x = x;
  atom.y = y;
}

export function recordMove() {
  snapshot();
}

export function setPositions(positions) {
  positions.forEach(([x, y], i) => {
    const atom = state.atoms[i];
    if (atom) { atom.x = x; atom.y = y; }
  });
  emit("arranged");
}

export function select(id) {
  state.selectedId = id;
  emit("selected", { id });
}

/** יחיד ← כפול ← משולש ← אין קשר. אם אין ידיים פנויות לשדרוג, הקשר מוסר. */
export function cycleBond(a, b) {
  const bond = findBond(a, b);
  state.selectedId = null;
  if (!bond) {
    const full = [a, b].filter((id) => freeHandsOf(id) < 1);
    if (full.length) {
      emit("bondRefused", { ids: full });
      return;
    }
    snapshot();
    state.fromDemo = false;
    state.bonds.push({ id: `b${nextId++}`, a, b, order: 1 });
    emit("bondChanged", { a, b, order: 1 });
  } else {
    snapshot();
    state.fromDemo = false;
    const canGrow = bond.order < 3 && freeHandsOf(a) > 0 && freeHandsOf(b) > 0;
    if (canGrow) {
      bond.order += 1;
      emit("bondChanged", { a, b, order: bond.order });
    } else {
      state.bonds = state.bonds.filter((x) => x !== bond);
      emit("bondChanged", { a, b, order: 0 });
    }
  }
  evaluate();
}

export function deleteAtom(id) {
  if (!findAtom(id)) return;
  snapshot();
  state.fromDemo = false;
  state.atoms = state.atoms.filter((a) => a.id !== id);
  state.bonds = state.bonds.filter((b) => b.a !== id && b.b !== id);
  if (state.selectedId === id) state.selectedId = null;
  emit("atomDeleted", { id });
  evaluate();
}

export function undo() {
  const prev = history.pop();
  if (!prev) return;
  state.atoms = prev.atoms;
  state.bonds = prev.bonds;
  state.fromDemo = prev.fromDemo;
  state.selectedId = null;
  emit("restored");
  evaluate();
}

export function clear() {
  if (!state.atoms.length) return;
  snapshot();
  state.atoms = [];
  state.bonds = [];
  state.selectedId = null;
  state.fromDemo = false;
  emit("restored");
  evaluate();
}

/** "הראה לי": טוען מולקולה מוכנה. positions – מערך [x,y] לפי סדר האטומים */
export function loadMolecule(mol, positions) {
  snapshot();
  const ids = mol.atoms.map(() => `a${nextId++}`);
  state.atoms = mol.atoms.map((symbol, i) => ({ id: ids[i], symbol, x: positions[i][0], y: positions[i][1] }));
  state.bonds = mol.bonds.map(([i, j, order]) => ({ id: `b${nextId++}`, a: ids[i], b: ids[j], order }));
  state.selectedId = null;
  state.fromDemo = true;
  state.result = null;
  if (state.challengeId === mol.id) state.challengeId = null;
  emit("restored");
  evaluate();
}

export function setChallenge(id) {
  state.challengeId = id;
  emit("challenge", { id });
}
