// סרגל האתגר הפעיל: שם, "מרכיבים" שמתמלאים, "הראה לי" וסגירה.
// לא חושף את המבנה – רק כמה אטומים מכל סוג צריך.

import * as store from "../core/store.js";
import { MOLECULE_MAP } from "../data/molecules.js";
import { ATOM_ORDER } from "../data/atoms.js";
import { el } from "./dom.js";

const barEl = document.getElementById("challenge-bar");

export function renderChallengeBar({ onShow, onEnd }) {
  const { challengeId, atoms } = store.getState();
  const mol = challengeId && MOLECULE_MAP[challengeId];
  barEl.hidden = !mol;
  document.getElementById("screen-build").classList.toggle("has-challenge", !!mol);
  if (!mol) return;

  const have = {};
  atoms.forEach((a) => { have[a.symbol] = (have[a.symbol] || 0) + 1; });
  const symbols = ATOM_ORDER.filter((s) => mol.counts[s] || have[s]);
  const chips = symbols.map((s) => {
    const need = mol.counts[s] || 0;
    const got = have[s] || 0;
    const cls = got === need ? "is-done" : got > need ? "is-over" : "";
    return el("span", { class: `chip ${cls}`, text: `${s} ${got}/${need}` });
  });

  barEl.replaceChildren(
    el("span", { class: "challenge-title" }, ["אתגר: ", el("b", { text: mol.name })]),
    el("span", { class: "chips", "aria-label": "אטומים נדרשים" }, chips),
    el("span", { class: "challenge-actions" }, [
      el("button", { type: "button", class: "btn btn-ghost", text: "הראה לי", onclick: () => onShow(mol) }),
      el("button", { type: "button", class: "btn btn-ghost", text: "סיים", onclick: onEnd }),
    ]),
  );
}
