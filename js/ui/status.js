// שורת המצב שמתחת לסרגל הכלים: משוב קצר על כל פעולה, ותוצאת "בדוק".

import * as store from "../core/store.js";
import { ATOMS } from "../data/atoms.js";
import { atomName, el } from "./dom.js";

const statusEl = document.getElementById("status");
const BOND_WORDS = { 0: "הקשר הוסר", 1: "קשר יחיד", 2: "קשר כפול", 3: "קשר משולש" };

export function say(text, tone = "") {
  statusEl.className = `status${tone ? ` is-${tone}` : ""}`;
  statusEl.replaceChildren(text);
}

/** הודעה עם כפתור (למשל "הצג" לפתיחת הגיליון בטלפון) */
export function sayWithAction(text, label, onClick, tone = "good") {
  statusEl.className = `status is-${tone}`;
  statusEl.replaceChildren(`${text} `, el("button", { type: "button", text: label, onclick: onClick }));
}

const nameOf = (id) => atomName(store.findAtom(id)?.symbol);

export function describeEvent(kind, payload) {
  switch (kind) {
    case "atomAdded": {
      if (payload.bonded) return say(BOND_WORDS[1]);
      const { symbol } = store.findAtom(payload.id);
      const hands = ATOMS[symbol].hands;
      return say(`${atomName(symbol)} · ${hands === 1 ? "יד אחת" : `${hands} ידיים`}`);
    }
    case "selected":
      return payload.id ? say(`בחרתם ${nameOf(payload.id)}. הקישו על אטום אחר כדי לחבר.`) : say("");
    case "bondChanged":
      return say(BOND_WORDS[payload.order]);
    case "bondRefused":
      return say(`ל${nameOf(payload.ids[0])} אין ידיים פנויות`, "bad");
    case "atomDeleted":
      return say("האטום נמחק");
    default:
      return undefined;
  }
}

/** תוצאת "בדוק": מה חסר, במילים פשוטות. מחזיר את האטומים שצריך להדגיש. */
export function explainCheck() {
  const { atoms, report } = store.getState();
  if (!atoms.length) { say("הלוח ריק. הקישו על אטום כדי להתחיל.", "bad"); return []; }
  if (atoms.length === 1) { say("צריך לפחות שני אטומים כדי לבנות מולקולה.", "bad"); return []; }
  if (report.complete) return null;
  const parts = [];
  const openIds = report.open.map((i) => atoms[i].id);
  if (openIds.length) {
    const names = [...new Set(openIds.map((id) => nameOf(id)))];
    parts.push(`ל${names.join(" ול")} נשארו ידיים פנויות`);
  }
  if (report.pieces > 1) parts.push("יש אטומים שלא מחוברים לשאר");
  say(`עוד לא גמור: ${parts.join(", ")}.`, "bad");
  return openIds;
}
