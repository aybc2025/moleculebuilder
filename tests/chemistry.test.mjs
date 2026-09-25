// הרצה: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";

import { MOLECULES, MOLECULE_MAP, parseBonds } from "../js/data/molecules.js";
import { ATOMS } from "../js/data/atoms.js";
import { analyze, hillFormula, toSubscript } from "../js/core/chemistry.js";
import { identify, isomorphic, moleculeGraph } from "../js/core/match.js";
import { embed3d } from "../js/core/geometry3d.js";
import { layout2d } from "../js/core/layout2d.js";
import * as store from "../js/core/store.js";

/** "CH3COOH", "CO(NH2)2" → ספירת אטומים */
function countFormula(formula) {
  const tokens = formula.match(/[A-Z][a-z]?\d*|\(|\)\d*/g);
  const stack = [{}];
  for (const t of tokens) {
    if (t === "(") { stack.push({}); continue; }
    if (t.startsWith(")")) {
      const mult = Number(t.slice(1) || 1);
      const inner = stack.pop();
      for (const [s, c] of Object.entries(inner)) stack.at(-1)[s] = (stack.at(-1)[s] || 0) + c * mult;
      continue;
    }
    const [, sym, n] = /([A-Z][a-z]?)(\d*)/.exec(t);
    stack.at(-1)[sym] = (stack.at(-1)[sym] || 0) + Number(n || 1);
  }
  return stack[0];
}

const angle = (a, c, b) => {
  const u = a.map((v, k) => v - c[k]);
  const w = b.map((v, k) => v - c[k]);
  const dot = u.reduce((s, v, k) => s + v * w[k], 0);
  return (Math.acos(dot / Math.hypot(...u) / Math.hypot(...w)) * 180) / Math.PI;
};

test("every molecule uses known atoms and its display formula matches", () => {
  for (const m of MOLECULES) {
    m.atoms.forEach((s) => assert.ok(ATOMS[s], `${m.id}: unknown atom ${s}`));
    assert.deepEqual(countFormula(m.formula), m.counts, `${m.id}: formula ${m.formula}`);
    assert.ok(m.name && m.text && m.tag, `${m.id}: missing text`);
  }
});

test("ids are unique", () => {
  assert.equal(new Set(MOLECULES.map((m) => m.id)).size, MOLECULES.length);
});

test("every molecule is complete: connected and all hands used", () => {
  for (const m of MOLECULES) {
    const r = analyze(moleculeGraph(m));
    assert.ok(r.complete, `${m.id}: open=${r.open} over=${r.over} pieces=${r.pieces}`);
  }
});

test("every molecule is recognised as itself and no two are the same", () => {
  for (const m of MOLECULES) {
    const res = identify(moleculeGraph(m));
    assert.equal(res.kind, "exact");
    assert.equal(res.molecule.id, m.id);
  }
  for (let i = 0; i < MOLECULES.length; i++) {
    for (let j = i + 1; j < MOLECULES.length; j++) {
      assert.ok(!isomorphic(moleculeGraph(MOLECULES[i]), moleculeGraph(MOLECULES[j])),
        `${MOLECULES[i].id} == ${MOLECULES[j].id}`);
    }
  }
});

test("atoms with no bonds are not a molecule (old bug)", () => {
  const r = analyze({ symbols: ["H", "H", "O"], bonds: [] });
  assert.equal(r.complete, false);
  assert.equal(r.pieces, 3);
});

test("recognition ignores atom order", () => {
  const shuffled = { symbols: ["H", "H", "O"], bonds: [[2, 0, 1], [1, 2, 1]] };
  assert.equal(identify(shuffled).molecule.id, "water");
});

test("same formula, different structure is reported as an isomer", () => {
  const propanol1 = {
    symbols: "C C C O H H H H H H H H".split(" "),
    bonds: parseBonds("0-1 1-2 2-3 3-4 0-5 0-6 0-7 1-8 1-9 2-10 2-11"),
  };
  const res = identify(propanol1);
  assert.equal(res.kind, "isomer");
  assert.equal(res.molecule.id, "isopropanol");
});

test("benzene is recognised whichever way the double bonds alternate", () => {
  const other = {
    symbols: MOLECULE_MAP.benzene.atoms,
    bonds: parseBonds("0-1 1=2 2-3 3=4 4-5 5=0 0-6 1-7 2-8 3-9 4-10 5-11"),
  };
  assert.equal(identify(other).molecule.id, "benzene");
});

test("hill formula", () => {
  assert.equal(hillFormula(["O", "H", "H"]), "H2O");
  assert.equal(hillFormula(["C", "O", "H", "H", "H", "H"]), "CH4O");
  assert.equal(toSubscript("C2H6"), "C₂H₆");
});

test("3D shapes follow VSEPR", () => {
  const p = (id) => embed3d(moleculeGraph(MOLECULE_MAP[id]));
  const w = p("water");
  assert.ok(Math.abs(angle(w[1], w[0], w[2]) - 104.5) < 2);
  const m = p("methane");
  assert.ok(Math.abs(angle(m[1], m[0], m[2]) - 109.5) < 2);
  const c = p("co2");
  assert.ok(angle(c[1], c[0], c[2]) > 172);
  const b = p("benzene");
  for (let i = 0; i < 6; i++) {
    assert.ok(Math.abs(angle(b[(i + 5) % 6], b[i], b[(i + 1) % 6]) - 120) < 3, `benzene angle ${i}`);
  }
});

test("board layout keeps atoms apart and inside the box", () => {
  for (const m of MOLECULES) {
    const pts = layout2d(moleculeGraph(m), { width: 340, height: 360, padding: 36 }, (s) => (s === "H" ? 19 : 25));
    pts.forEach(([x, y]) => assert.ok(x >= 0 && x <= 340 && y >= 0 && y <= 360, `${m.id} out of box`));
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
        assert.ok(d > 30, `${m.id}: atoms ${i},${j} overlap (${d.toFixed(1)})`);
      }
    }
  }
});

test("store: building water by hand is recognised and solves the challenge", () => {
  const events = [];
  store.subscribe((_, e) => events.push(e));
  store.setChallenge("water");
  const o = store.addAtom("O", 100, 100);
  store.addAtom("H", 50, 150, o.id);
  const h2 = store.addAtom("H", 150, 150);
  assert.equal(store.getState().result, null);
  store.cycleBond(o.id, h2.id);
  const rec = events.find((e) => e.kind === "recognized");
  assert.ok(rec);
  assert.equal(rec.payload.result.molecule.id, "water");
  assert.equal(rec.payload.solved, true);

  // קשר שלא ניתן לשדרג (אין ידיים) מוסר, ולא נתקע
  store.cycleBond(o.id, h2.id);
  assert.equal(store.getState().bonds.length, 1);
  store.undo();
  assert.equal(store.getState().bonds.length, 2);
});
