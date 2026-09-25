// קלט על הלוח: הקשה בוחרת/מחברת, גרירה מזיזה, "מחק אטום", ומקלדת.

import * as store from "../core/store.js";
import { boardElement, dragTo } from "./board.js";

const DRAG_THRESHOLD = 6;

let drag = null;          // { id, pointerId, startX, startY, offX, offY, moved }
let suppressClick = false;

function localPoint(e) {
  const rect = boardElement.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onPointerDown(e) {
  const node = e.target.closest(".atom");
  if (!node) {
    if (!e.target.closest(".atom-delete") && store.getState().selectedId) store.select(null);
    return;
  }
  const atom = store.findAtom(node.dataset.id);
  if (!atom) return;
  const p = localPoint(e);
  drag = { id: atom.id, pointerId: e.pointerId, startX: p.x, startY: p.y, offX: atom.x - p.x, offY: atom.y - p.y, moved: false };
  node.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const p = localPoint(e);
  if (!drag.moved) {
    if (Math.hypot(p.x - drag.startX, p.y - drag.startY) < DRAG_THRESHOLD) return;
    drag.moved = true;
    store.recordMove();
    boardElement.querySelector(`[data-id="${drag.id}"]`)?.classList.add("is-dragging");
  }
  dragTo(drag.id, p.x + drag.offX, p.y + drag.offY);
}

function endDrag(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  if (drag.moved) {
    suppressClick = true;
    boardElement.querySelector(`[data-id="${drag.id}"]`)?.classList.remove("is-dragging");
  }
  drag = null;
}

export function tapAtom(id) {
  const { selectedId } = store.getState();
  if (!selectedId) store.select(id);
  else if (selectedId === id) store.select(null);
  else store.cycleBond(selectedId, id);
}

function onClick(e) {
  if (e.target.closest(".atom-delete")) {
    const { selectedId } = store.getState();
    if (selectedId) store.deleteAtom(selectedId);
    return;
  }
  const node = e.target.closest(".atom");
  if (!node) return;
  if (suppressClick) { suppressClick = false; return; }
  tapAtom(node.dataset.id);
}

function onKeyDown(e) {
  const node = e.target.closest(".atom");
  if (node && (e.key === "Delete" || e.key === "Backspace")) {
    e.preventDefault();
    store.deleteAtom(node.dataset.id);
  } else if (e.key === "Escape" && store.getState().selectedId) {
    store.select(null);
  }
}

export function initBoardInput() {
  boardElement.addEventListener("pointerdown", onPointerDown);
  boardElement.addEventListener("pointermove", onPointerMove);
  boardElement.addEventListener("pointerup", endDrag);
  boardElement.addEventListener("pointercancel", endDrag);
  boardElement.addEventListener("click", onClick);
  boardElement.addEventListener("keydown", onKeyDown);
}
