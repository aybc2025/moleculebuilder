// נקודת הכניסה: מחבר בין ה־store (לוגיקה) לבין מודולי התצוגה.

import * as store from "./core/store.js";
import { markDone, doneCount } from "./core/progress.js";
import { layout2d } from "./core/layout2d.js";
import { moleculeGraph } from "./core/match.js";
import { installAtomColors, atomRadius, reducedMotion } from "./ui/dom.js";
import * as board from "./ui/board.js";
import { initBoardInput } from "./ui/boardInput.js";
import { initTray } from "./ui/tray.js";
import { initNav, showScreen } from "./ui/nav.js";
import * as status from "./ui/status.js";
import * as panel from "./ui/moleculePanel.js";
import { renderChallengeBar } from "./ui/challengeBar.js";
import { renderChallenges } from "./ui/challengesScreen.js";
import { renderAtoms } from "./ui/atomsScreen.js";
import { celebrate } from "./ui/celebrate.js";
import { initUpdates } from "./ui/updateBanner.js";

const undoBtn = document.getElementById("btn-undo");
const clearBtn = document.getElementById("btn-clear");
const checkBtn = document.getElementById("btn-check");
const starsCount = document.getElementById("stars-count");

function boardBox(padding = 44) {
  return { ...board.boardSize(), padding };
}

// ---- פעולות ברמת המשחק ----

function startChallenge(mol) {
  showScreen("screen-build");
  panel.closeSheet();
  store.clear();
  store.setChallenge(mol.id);
  status.say(`בנו ${mol.name}. המרכיבים מופיעים למעלה.`);
}

function showMolecule(mol) {
  showScreen("screen-build");
  requestAnimationFrame(() => {
    store.loadMolecule(mol, layout2d(moleculeGraph(mol), boardBox(), atomRadius));
  });
}

const challengeHandlers = { onStart: startChallenge, onShow: showMolecule };

function endChallenge() {
  store.setChallenge(null);
  status.say("");
}

function refreshProgress() {
  starsCount.textContent = String(doneCount());
  renderChallenges(challengeHandlers);
}

function refreshToolbar() {
  const { atoms } = store.getState();
  undoBtn.disabled = !store.canUndo();
  clearBtn.disabled = atoms.length === 0;
  checkBtn.disabled = atoms.length === 0;
}

// ---- תגובה לאירועי ה־store ----

function onRecognized(payload) {
  const { result, fromDemo } = payload;
  const challengeId = payload.solved ? payload.result.molecule.id : store.getState().challengeId;
  let firstTime = false;
  if (result.kind === "exact" && !fromDemo) {
    firstTime = markDone(result.molecule.id);
    if (firstTime) refreshProgress();
  }

  // מסדרים את האטומים במבנה אמיתי (רק כשנבנה בידיים; הדגמה כבר מסודרת)
  if (!fromDemo) {
    store.setPositions(layout2d(store.graph(), boardBox(), atomRadius));
    const { width, height } = board.boardSize();
    celebrate(store.getState().atoms.map((a) => a.symbol), { x: width / 2, y: height / 2 });
  }

  // בטלפון הגיליון עולה אחרי שהחגיגה על הלוח נגמרת
  panel.showResult({ ...payload, firstTime, challengeId }, store.graph(), fromDemo || reducedMotion() ? 0 : 900);
  const name = result.kind === "exact" ? result.molecule.name : "מולקולה חדשה";
  const text = payload.solved ? `כל הכבוד! בניתם ${name}.` : fromDemo ? `הדגמה: ${name}` : `זיהינו: ${name}`;
  status.sayWithAction(text, "פרטים", panel.openSheet, fromDemo ? "" : "good");
}

function onStoreEvent(state, { kind, payload }) {
  switch (kind) {
    case "atomAdded": board.sync(payload.id); break;
    case "arranged": board.glideToState(); break;
    case "bondRefused": board.flashAtoms(payload.ids, "is-error", 320); board.sync(); break;
    case "changed": board.sync(); break;
    case "challenge": break;
    case "recognized": onRecognized(payload); break;
    default: board.sync();
  }
  status.describeEvent(kind, payload);
  if (kind === "changed" && !state.result) {
    panel.showIdle(state.report, state.atoms.length);
    panel.closeSheet();
  }
  if (kind === "changed" || kind === "challenge" || kind === "recognized") {
    renderChallengeBar({ onShow: showMolecule, onEnd: endChallenge });
  }
  refreshToolbar();
}

function onCheck() {
  const open = status.explainCheck();
  if (open === null) {
    const { result } = store.getState();
    if (result) panel.openSheet();
    return;
  }
  board.flashAtoms(open, "is-hint", 2400);
}

// ---- אתחול ----

function init() {
  installAtomColors();
  initNav();
  initTray();
  initBoardInput();
  panel.initPanel();
  store.subscribe(onStoreEvent);

  undoBtn.addEventListener("click", () => store.undo());
  clearBtn.addEventListener("click", () => { store.clear(); panel.closeSheet(); });
  checkBtn.addEventListener("click", onCheck);
  new ResizeObserver(() => board.keepInside()).observe(board.boardElement);

  renderAtoms({ onStart: startChallenge });
  refreshProgress();
  refreshToolbar();
  board.sync();
  initUpdates();
}

init();
