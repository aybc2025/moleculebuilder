// חגיגה כשמזהים מולקולה: התפרצות נקודות בצבעי האטומים.
// מאגר קבוע של 24 נקודות שנוצרות פעם אחת ומשמשות שוב ושוב.
// reduced-motion: הבהוב ירוק של הלוח במקום תנועה.

import { ATOMS } from "../data/atoms.js";
import { reducedMotion } from "./dom.js";

const burstEl = document.getElementById("burst");
const boardEl = document.getElementById("board");
const POOL = 24;
const pool = [];

function ensurePool() {
  if (pool.length) return;
  for (let i = 0; i < POOL; i++) {
    const dot = document.createElement("i");
    burstEl.append(dot);
    pool.push(dot);
  }
}

export function celebrate(symbols, center) {
  if (reducedMotion()) {
    boardEl.classList.add("is-flash");
    setTimeout(() => boardEl.classList.remove("is-flash"), 600);
    return;
  }
  ensurePool();
  const colors = [...new Set(symbols)].map((s) => (s === "H" ? "#b9c4cf" : ATOMS[s].color));
  colors.push("#f26b1d");
  pool.forEach((dot, i) => {
    const angle = (i / POOL) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 90 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    dot.style.setProperty("--c", colors[i % colors.length]);
    dot.getAnimations().forEach((a) => a.cancel());
    dot.animate(
      [
        { opacity: 1, transform: `translate(${center.x}px, ${center.y}px) scale(0.6)` },
        { opacity: 1, transform: `translate(${center.x + dx * 0.8}px, ${center.y + dy * 0.8}px) scale(1)`, offset: 0.6 },
        { opacity: 0, transform: `translate(${center.x + dx}px, ${center.y + dy + 30}px) scale(0.8)` },
      ],
      { duration: 900, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" },
    );
  });
}
