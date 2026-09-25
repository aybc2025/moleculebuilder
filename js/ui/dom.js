// עזרים קטנים ל־DOM. כל טקסט נכנס דרך textContent (בלי innerHTML).

import { ATOMS } from "../data/atoms.js";

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "data") Object.assign(node.dataset, value);
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  [].concat(children).forEach((c) => c != null && node.append(c));
  return node;
}

/** "CH3COOH" → <span class="formula">CH<sub>3</sub>COOH</span> */
export function formulaNode(formula) {
  const node = el("span", { class: "formula" });
  formula.split(/(\d+)/).forEach((part) => {
    if (!part) return;
    node.append(/^\d+$/.test(part) ? el("sub", { text: part }) : part);
  });
  return node;
}

export function ball(symbol, extraClass = "") {
  return el("span", { class: `ball ${extraClass}`.trim(), data: { symbol }, text: symbol });
}

/** רדיוס האטום על הלוח בפיקסלים – חייב להתאים ל־board.css */
export function atomRadius(symbol) {
  if (symbol === "H") return 20;
  if (symbol === "Cl") return 23;
  return 25;
}

export function atomName(symbol) {
  return ATOMS[symbol]?.name ?? symbol;
}

/** הצבעים מוגדרים רק ב־atoms.js; כאן הם הופכים למשתני CSS */
export function installAtomColors() {
  const root = document.documentElement.style;
  for (const atom of Object.values(ATOMS)) {
    root.setProperty(`--atom-${atom.symbol}`, atom.color);
    root.setProperty(`--atom-ink-${atom.symbol}`, atom.ink);
  }
}

export const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
