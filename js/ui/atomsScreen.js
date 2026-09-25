// מסך האטומים: כל אטום עם הידיים שלו כנקודות, הסבר, ומולקולות שבונים איתו.

import { ATOMS, ATOM_ORDER } from "../data/atoms.js";
import { MOLECULES } from "../data/molecules.js";
import { el, ball } from "./dom.js";
import { pegAngles } from "./pegs.js";

const listEl = document.getElementById("atom-cards");

function bigAtom(symbol) {
  const node = ball(symbol);
  node.style.setProperty("--size", "58px");
  pegAngles([], ATOMS[symbol].hands).forEach((deg) => {
    const peg = el("span", { class: "peg" });
    peg.style.setProperty("--a", `${deg}deg`);
    node.append(peg);
  });
  return el("span", { class: "atom-big", "aria-hidden": "true" }, node);
}

export function renderAtoms({ onStart }) {
  listEl.replaceChildren(...ATOM_ORDER.map((symbol) => {
    const atom = ATOMS[symbol];
    const uses = MOLECULES.filter((m) => m.counts[symbol]).slice(0, 6);
    return el("article", { class: "atom-card" }, [
      el("div", { class: "atom-card-head" }, [
        bigAtom(symbol),
        el("div", {}, [
          el("h2", { text: atom.name }),
          el("span", { class: "atom-hands", text: atom.hands === 1 ? "יד אחת" : `${atom.hands} ידיים` }),
        ]),
      ]),
      el("p", { text: atom.text }),
      el("div", { class: "atom-links" }, uses.map((m) =>
        el("button", { type: "button", text: m.name, onclick: () => onStart(m) }),
      )),
    ]);
  }));
}
