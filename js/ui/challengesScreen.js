// מסך האתגרים: התקדמות + כרטיס לכל מולקולה, מקובץ לפי רמה.
// כרטיס שעוד לא נפתר מראה רק את המרכיבים; אחרי שנבנה – את המבנה וכוכב.

import { MOLECULES, LEVELS } from "../data/molecules.js";
import { isDone, doneCount } from "../core/progress.js";
import { el, formulaNode } from "./dom.js";
import { ingredients, structure } from "./miniMolecule.js";

const levelsEl = document.getElementById("challenge-levels");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

const LEVEL_HINT = { easy: "עד 3 אטומים", medium: "4–6 אטומים", hard: "7–10 אטומים", expert: "11 אטומים ומעלה" };

function card(mol, handlers) {
  const done = isDone(mol.id);
  return el("button", {
    type: "button",
    class: "mol-card",
    "aria-label": `${mol.name}${done ? ", הושלם" : ""}`,
    onclick: () => (done ? handlers.onShow(mol) : handlers.onStart(mol)),
  }, [
    el("span", { class: "mol-thumb" }, done ? structure(mol) : ingredients(mol)),
    el("span", { class: "mol-info" }, [
      el("span", { class: "mol-name", text: mol.name }),
      el("span", { class: "mol-sub" }, [formulaNode(mol.formula), el("span", { text: mol.tag })]),
    ]),
    done ? el("span", { class: "star", "aria-hidden": "true" }) : el("span", { class: "mol-go", text: "התחל" }),
  ]);
}

export function renderChallenges(handlers) {
  const total = MOLECULES.length;
  const done = doneCount();
  progressText.textContent = `${done} מתוך ${total} מולקולות`;
  progressFill.style.setProperty("--p", String(done / total));

  levelsEl.replaceChildren(...LEVELS.map((level) => {
    const list = MOLECULES.filter((m) => m.level === level.id);
    const finished = list.filter((m) => isDone(m.id)).length;
    return el("section", { class: "level" }, [
      el("h2", {}, [level.name, el("small", { text: `${LEVEL_HINT[level.id]} · ${finished}/${list.length}` })]),
      el("div", { class: "card-grid" }, list.map((m) => card(m, handlers))),
    ]);
  }));
}
