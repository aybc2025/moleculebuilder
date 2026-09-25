// אוסף המולקולות המוכרות. כל מולקולה מוגדרת פעם אחת כגרף,
// וכל השאר (רמה, ספירת אטומים, פריסה, תלת־ממד, זיהוי) נגזר ממנו.

import easy from "./molecules-easy.js";
import medium from "./molecules-medium.js";
import hard from "./molecules-hard.js";

const BOND_RE = /^(\d+)([-=#])(\d+)$/;
const ORDER = { "-": 1, "=": 2, "#": 3 };

export const LEVELS = [
  { id: "easy", name: "קל", max: 3 },
  { id: "medium", name: "בינוני", max: 6 },
  { id: "hard", name: "מאתגר", max: 10 },
  { id: "expert", name: "אלוף", max: Infinity },
];

export function parseBonds(spec) {
  return spec.trim().split(/\s+/).map((token) => {
    const m = BOND_RE.exec(token);
    if (!m) throw new Error(`Bad bond "${token}"`);
    return [Number(m[1]), Number(m[3]), ORDER[m[2]]];
  });
}

function build(raw) {
  const atoms = raw.atoms.trim().split(/\s+/);
  const counts = {};
  atoms.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
  const level = LEVELS.find((l) => atoms.length <= l.max).id;
  return Object.freeze({ ...raw, atoms, bonds: parseBonds(raw.bonds), counts, level });
}

export const MOLECULES = [...easy, ...medium, ...hard]
  .map(build)
  .sort((a, b) => a.atoms.length - b.atoms.length);

export const MOLECULE_MAP = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));
