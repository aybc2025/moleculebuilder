// תמונות קטנות לכרטיסים:
//  ingredients – רק האטומים שצריך (לאתגר שעוד לא נפתר – לא חושף את המבנה)
//  structure   – המבנה המלא ב־SVG (אחרי שנבנה)

import { ATOMS, ATOM_ORDER } from "../data/atoms.js";
import { layout2d } from "../core/layout2d.js";
import { moleculeGraph } from "../core/match.js";
import { el, ball } from "./dom.js";

const SVG = "http://www.w3.org/2000/svg";

export function ingredients(mol) {
  return el("span", { class: "ingredients", "aria-hidden": "true" },
    ATOM_ORDER.filter((s) => mol.counts[s]).map((s) =>
      el("span", { class: "ingredient" }, [ball(s), mol.counts[s] > 1 ? `×${mol.counts[s]}` : ""]),
    ),
  );
}

function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

export function structure(mol) {
  const W = 128, H = 112;
  const r = (s) => (s === "H" ? 9 : 12);
  const pts = layout2d(moleculeGraph(mol), { width: W, height: H, padding: 14 }, r);
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  mol.bonds.forEach(([i, j, order]) => {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[j];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    for (let k = 0; k < order; k++) {
      const off = (k - (order - 1) / 2) * 5;
      svg.append(svgEl("line", {
        x1: x1 + nx * off, y1: y1 + ny * off, x2: x2 + nx * off, y2: y2 + ny * off,
        stroke: "#17263a", "stroke-width": order > 1 ? 2.2 : 3.5, "stroke-linecap": "round",
      }));
    }
  });
  mol.atoms.forEach((s, i) => {
    svg.append(svgEl("circle", {
      cx: pts[i][0], cy: pts[i][1], r: r(s),
      fill: ATOMS[s].color, stroke: s === "H" ? "#b9c4cf" : "none", "stroke-width": 1.5,
    }));
  });
  return svg;
}
