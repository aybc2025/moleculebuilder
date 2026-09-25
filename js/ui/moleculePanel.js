// פאנל המולקולה: תוצאה (שם, נוסחה, הסבר) + תלת־ממד.
// בטלפון זה גיליון תחתון שנפתח בזיהוי; במחשב הוא תמיד גלוי בצד.

import { MOLECULE_MAP } from "../data/molecules.js";
import { el, formulaNode } from "./dom.js";
import * as viewer from "./viewer3d.js";

const panelEl = document.getElementById("panel");
const bodyEl = document.getElementById("panel-body");
const closeBtn = document.getElementById("panel-close");
let lastFocus = null;

const isSheet = () => !window.matchMedia("(min-width: 900px)").matches;

export function openSheet() {
  if (!isSheet() || panelEl.classList.contains("is-open")) return;
  lastFocus = document.activeElement;
  panelEl.classList.add("is-open");
  closeBtn.focus({ preventScroll: true });
}

export function closeSheet() {
  clearTimeout(openTimer);
  if (!panelEl.classList.contains("is-open")) return;
  panelEl.classList.remove("is-open");
  lastFocus?.focus?.({ preventScroll: true });
}

function head(name, formula) {
  return el("div", { class: "result-head" }, [
    el("h2", { class: "result-name", text: name }),
    formulaNode(formula),
  ]);
}

let openTimer = 0;

/**
 * payload מאירוע recognized, ועוד:
 *  firstTime   – נבנתה בפעם הראשונה (כוכב חדש)
 *  challengeId – האתגר שהיה פעיל
 *  delay       – השהיה לפני פתיחת הגיליון בטלפון
 */
export function showResult({ result, formula, fromDemo, solved, firstTime, challengeId }, graph, delay = 0) {
  const nodes = [];
  if (result.kind === "exact") {
    const mol = result.molecule;
    if (solved) nodes.push(el("p", { class: "result-note is-good", text: "★ כל הכבוד! השלמתם את האתגר." }));
    else if (firstTime) nodes.push(el("p", { class: "result-note is-good", text: "★ מולקולה חדשה באוסף!" }));
    else if (fromDemo) nodes.push(el("p", { class: "result-note is-info", text: "זו הדגמה. בנו אותה בעצמכם כדי לקבל כוכב." }));
    if (challengeId && challengeId !== mol.id && !fromDemo) {
      const target = MOLECULE_MAP[challengeId];
      nodes.push(el("p", { class: "result-note is-info", text: `בניתם ${mol.name}, אבל האתגר הוא ${target.name}.` }));
    }
    nodes.push(head(mol.name, mol.formula));
    nodes.push(el("p", { class: "result-tag", text: mol.tag }));
    nodes.push(el("p", { class: "result-text", text: mol.text }));
  } else {
    nodes.push(head("מולקולה חדשה!", formula));
    if (result.kind === "isomer") {
      nodes.push(el("p", {
        class: "result-text",
        text: `יש לה אותה נוסחה כמו ${result.molecule.name}, אבל האטומים מסודרים אחרת. מולקולות כאלה נקראות איזומרים.`,
      }));
    } else {
      nodes.push(el("p", { class: "result-text", text: "כל הידיים תפוסות, והמבנה חוקי. היא לא ברשימה שלנו." }));
    }
  }
  bodyEl.replaceChildren(...nodes);
  viewer.show(graph);
  clearTimeout(openTimer);
  openTimer = setTimeout(openSheet, delay);
}

/** כשאין מולקולה שלמה: מה חסר */
export function showIdle(report, atomCount) {
  viewer.clear();
  if (!atomCount) {
    bodyEl.replaceChildren();
    return;
  }
  const freeTotal = report.free.reduce((s, f) => s + Math.max(0, f), 0);
  const lines = [];
  if (report.pieces > 1) lines.push(`יש ${report.pieces} חלקים שלא מחוברים`);
  if (freeTotal === 1) lines.push("נשארה יד פנויה אחת");
  else if (freeTotal > 1) lines.push(`נשארו ${freeTotal} ידיים פנויות`);
  bodyEl.replaceChildren(
    el("div", { class: "panel-idle" }, [
      el("b", { text: "עוד לא מולקולה שלמה" }),
      el("span", { text: lines.join(" · ") }),
    ]),
  );
}

export function initPanel() {
  closeBtn.addEventListener("click", closeSheet);
  panelEl.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
  viewer.initViewer();
}
