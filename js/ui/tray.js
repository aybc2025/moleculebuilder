// מגש האטומים. הקשה מוסיפה אטום: אם יש אטום נבחר עם יד פנויה – ליד אותו אטום ומחובר אליו,
// אחרת במקום פנוי. אפשר גם לגרור אטום מהמגש אל נקודה על הלוח.

import * as store from "../core/store.js";
import { ATOMS, ATOM_ORDER } from "../data/atoms.js";
import { findFreeSpot } from "../core/placement.js";
import { boardElement, boardSize } from "./board.js";
import { el, ball } from "./dom.js";

const trayEl = document.getElementById("tray");
const DRAG_THRESHOLD = 8;

let drag = null; // { symbol, pointerId, startX, startY, ghost }
let suppressClick = false;

export function addFromTray(symbol) {
  const { width, height } = boardSize();
  const { atoms, selectedId } = store.getState();
  const anchor = selectedId && store.freeHandsOf(selectedId) > 0 ? store.findAtom(selectedId) : null;
  const spot = findFreeSpot(atoms, width, height, anchor);
  store.addAtom(symbol, spot.x, spot.y, anchor?.id ?? null);
}

function onPointerDown(e) {
  const btn = e.target.closest(".tray-atom");
  if (!btn || e.button > 0) return;
  drag = { symbol: btn.dataset.symbol, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, ghost: null };
  btn.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  if (!drag.ghost) {
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
    drag.ghost = ball(drag.symbol, "drag-ghost");
    document.body.append(drag.ghost);
  }
  drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
}

function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  if (drag.ghost) {
    drag.ghost.remove();
    suppressClick = true;
    const rect = boardElement.getBoundingClientRect();
    const inside = e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom;
    if (inside) store.addAtom(drag.symbol, e.clientX - rect.left, e.clientY - rect.top);
  }
  drag = null;
}

function onClick(e) {
  const btn = e.target.closest(".tray-atom");
  if (!btn) return;
  if (suppressClick) { suppressClick = false; return; }
  addFromTray(btn.dataset.symbol);
}

export function initTray() {
  ATOM_ORDER.forEach((symbol) => {
    const atom = ATOMS[symbol];
    const hands = atom.hands === 1 ? "יד אחת" : `${atom.hands} ידיים`;
    trayEl.append(
      el("button", { type: "button", class: "tray-atom", data: { symbol }, "aria-label": `הוסף ${atom.name}` }, [
        ball(symbol),
        el("span", { text: atom.name }),
        el("span", { class: "tray-hands", text: hands }),
      ]),
    );
  });
  trayEl.addEventListener("pointerdown", onPointerDown);
  trayEl.addEventListener("pointermove", onPointerMove);
  trayEl.addEventListener("pointerup", onPointerUp);
  trayEl.addEventListener("pointercancel", () => { drag?.ghost?.remove(); drag = null; });
  trayEl.addEventListener("click", onClick);
}
