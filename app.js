// ===== נתוני בסיס: אטומים ומולקולות מוכרות =====

const ATOM_DEFS = [
  {
    symbol: "H",
    name_he: "מימן",
    color: "#fde047",
    maxBonds: 1,
    desc_he: "למימן יש יד אחת. הוא אוהב להחזיק חבר אחד חזק.",
  },
  {
    symbol: "O",
    name_he: "חמצן",
    color: "#38bdf8",
    maxBonds: 2,
    desc_he: "לחמצן יש שתי ידיים. הוא מחזיק שני חברים, כמו במים.",
  },
  {
    symbol: "N",
    name_he: "חנקן",
    color: "#a855f7",
    maxBonds: 3,
    desc_he: "לחנקן יש שלוש ידיים. הוא נמצא באוויר שאנו נושמים.",
  },
  {
    symbol: "C",
    name_he: "פחמן",
    color: "#f97316",
    maxBonds: 4,
    desc_he: "לפחמן יש ארבע ידיים. הוא אוהב להתחבר להמון חברים שונים.",
  },
];

const KNOWN_MOLECULES = [
  {
    id: "water",
    name_he: "מים",
    formula: "H₂O",
    atomCounts: { H: 2, O: 1 },
    expl_he:
      "זאת מולקולת מים. יש בה שני אטומי מימן ואטום חמצן אחד. המים הם מה שאנחנו שותים, שוחים בהם ומתקלחים בהם.",
  },
  {
    id: "oxygen",
    name_he: "חמצן נשימתי",
    formula: "O₂",
    atomCounts: { O: 2 },
    expl_he:
      "פה יש שתי מולקולות של חמצן מחוברות יחד. זה הגז שאנו נושמים מהאוויר.",
  },
  {
    id: "carbon-dioxide",
    name_he: "פחמן דו־חמצני",
    formula: "CO₂",
    atomCounts: { C: 1, O: 2 },
    expl_he:
      "זאת מולקולת פחמן דו־חמצני. אנחנו נושפים אותה החוצה כשאנחנו נושמים.",
  },
  {
    id: "methane",
    name_he: "מתאן",
    formula: "CH₄",
    atomCounts: { C: 1, H: 4 },
    expl_he: "זאת מולקולת מתאן. זה גז שיכול לשמש כדלק.",
  },
  {
    id: "ammonia",
    name_he: "אמוניה",
    formula: "NH₃",
    atomCounts: { N: 1, H: 3 },
    expl_he:
      "זאת מולקולת אמוניה. משתמשים בה לעיתים בחומרי ניקוי ובתעשייה.",
  },
];

const ATOM_MAP = ATOM_DEFS.reduce((map, atom) => {
  map[atom.symbol] = atom;
  return map;
}, {});

// ===== מצב המשחק =====

let atomsOnBoard = []; // [{id, symbol, x, y}]
let bonds = []; // [{id, aId, bId, order}]
let atomIdCounter = 1;
let bondIdCounter = 1;
let selectedAtomId = null;

// מצב גרירה
let dragState = {
  atomId: null,
  offsetX: 0,
  offsetY: 0,
  moved: false,
};
let suppressNextClick = false;

// אלמנטים

const boardEl = document.getElementById("board");
const bondLayerEl = document.getElementById("bond-layer");
const atomPaletteEl = document.getElementById("atom-palette");
const messageAreaEl = document.getElementById("message-area");
const moleculeInfoEl = document.getElementById("molecule-info");
const atomInfoListEl = document.getElementById("atom-info-list");

// ===== אתחול =====

document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  buildAtomPalette();
  buildAtomInfoList();
  attachButtons();
});

// ===== מסכים =====

function initScreens() {
  const buttons = document.querySelectorAll("[data-screen-target]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-screen-target");
      switchScreen(targetId);
    });
  });
}

function switchScreen(targetId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === targetId);
  });
}

// ===== סרגל אטומים =====

function buildAtomPalette() {
  const existingButtons = atomPaletteEl.querySelectorAll(".atom-button");
  existingButtons.forEach((b) => b.remove());

  ATOM_DEFS.forEach((atom) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "atom-button";
    btn.dataset.symbol = atom.symbol;

    const main = document.createElement("div");
    main.className = "atom-button-main";

    const badge = document.createElement("div");
    badge.className = "atom-badge";
    badge.style.background = atom.color;
    badge.textContent = atom.symbol;

    const label = document.createElement("div");
    label.className = "atom-label";

    const name = document.createElement("div");
    name.className = "atom-name";
    name.textContent = atom.name_he;

    const maxBonds = document.createElement("div");
    maxBonds.className = "atom-maxbonds";
    maxBonds.textContent = `מספר ידיים: ${atom.maxBonds}`;

    label.appendChild(name);
    label.appendChild(maxBonds);
    main.appendChild(badge);
    main.appendChild(label);

    const addLabel = document.createElement("div");
    addLabel.className = "atom-add-label";
    addLabel.textContent = "+ הוסף ללוח";

    btn.appendChild(main);
    btn.appendChild(addLabel);

    btn.addEventListener("click", () => {
      addAtomToBoard(atom.symbol);
    });

    atomPaletteEl.appendChild(btn);
  });
}

// ===== מסך מידע על אטומים =====

function buildAtomInfoList() {
  atomInfoListEl.innerHTML = "";

  ATOM_DEFS.forEach((atom) => {
    const card = document.createElement("div");
    card.className = "atom-info-card";

    const header = document.createElement("div");
    header.className = "atom-info-header";

    const badge = document.createElement("div");
    badge.className = "atom-info-badge";
    badge.style.background = atom.color;
    badge.textContent = atom.symbol;

    const nameBox = document.createElement("div");
    const name = document.createElement("div");
    name.className = "atom-info-name";
    name.textContent = atom.name_he;

    const maxText = document.createElement("div");
    maxText.className = "atom-info-maxbonds";
    maxText.textContent = `מספר ידיים: ${atom.maxBonds}`;

    nameBox.appendChild(name);
    nameBox.appendChild(maxText);

    header.appendChild(badge);
    header.appendChild(nameBox);

    const desc = document.createElement("div");
    desc.className = "atom-info-desc";
    desc.textContent = atom.desc_he;

    card.appendChild(header);
    card.appendChild(desc);

    atomInfoListEl.appendChild(card);
  });
}

// ===== כפתורי פעולה =====

function attachButtons() {
  const checkBtn = document.getElementById("btn-check-molecule");
  const resetBtn = document.getElementById("btn-reset-board");

  checkBtn.addEventListener("click", () => {
    checkCurrentMolecule();
  });

  resetBtn.addEventListener("click", () => {
    resetBoard();
  });

  // לחיצה על הרקע מבטלת בחירה
  boardEl.addEventListener("click", () => {
    selectedAtomId = null;
    updateSelectionVisual();
  });
}

// ===== לוח עבודה =====

function addAtomToBoard(symbol) {
  const atomDef = ATOM_MAP[symbol];
  if (!atomDef) return;

  const rect = boardEl.getBoundingClientRect();
  const padding = 70;
  const x = Math.random() * (rect.width - padding * 2) + padding;
  const y = Math.random() * (rect.height - padding * 2) + padding;

  const atom = {
    id: "a" + atomIdCounter++,
    symbol,
    x,
    y,
  };
  atomsOnBoard.push(atom);
  renderBoard();

  showMessage(`הוספת אטום ${atomDef.name_he} ללוח.`, "neutral");
}

function renderBoard() {
  const existingNodes = boardEl.querySelectorAll(".atom-node");
  existingNodes.forEach((n) => n.remove());

  while (bondLayerEl.firstChild) {
    bondLayerEl.removeChild(bondLayerEl.firstChild);
  }

  // אטומים
  atomsOnBoard.forEach((atom) => {
    const atomDef = ATOM_MAP[atom.symbol];
    const node = document.createElement("div");
    node.className = "atom-node";
    node.dataset.atomId = atom.id;
    node.style.background = atomDef?.color || "#e5e7eb";

    const symbolSpan = document.createElement("span");
    symbolSpan.textContent = atom.symbol;

    const extraSpan = document.createElement("span");
    extraSpan.className = "atom-node-small";
    const usedBonds = getBondOrderSum(atom.id);
    extraSpan.textContent = `${usedBonds}/${atomDef.maxBonds} ידיים`;

    node.appendChild(symbolSpan);
    node.appendChild(extraSpan);

    node.style.left = `${atom.x - 26}px`;
    node.style.top = `${atom.y - 26}px`;

    // קליק לבחירה/יצירת קשר
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      handleAtomClick(atom.id);
    });

    // גרירה – pointer events
    node.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const rect = boardEl.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      dragState.atomId = atom.id;
      dragState.offsetX = atom.x - pointerX;
      dragState.offsetY = atom.y - pointerY;
      dragState.moved = false;
      node.setPointerCapture(e.pointerId);
    });

    node.addEventListener("pointermove", (e) => {
      if (dragState.atomId !== atom.id) return;
      e.preventDefault();
      const rect = boardEl.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      let newX = pointerX + dragState.offsetX;
      let newY = pointerY + dragState.offsetY;

      // גבולות הלוח
      const r = 26;
      newX = Math.max(r, Math.min(rect.width - r, newX));
      newY = Math.max(r, Math.min(rect.height - r, newY));

      atom.x = newX;
      atom.y = newY;
      dragState.moved = true;

      renderBoard();
    });

    node.addEventListener("pointerup", (e) => {
      if (dragState.atomId === atom.id) {
        node.releasePointerCapture(e.pointerId);
        if (dragState.moved) {
          suppressNextClick = true; // לא להפעיל קליק אחרי גרירה
        }
        dragState.atomId = null;
      }
    });

    node.addEventListener("pointercancel", (e) => {
      if (dragState.atomId === atom.id) {
        node.releasePointerCapture(e.pointerId);
        dragState.atomId = null;
      }
    });

    boardEl.appendChild(node);
  });

  // קשרים (כולל קשר כפול)
  bonds.forEach((bond) => {
    const atomA = atomsOnBoard.find((a) => a.id === bond.aId);
    const atomB = atomsOnBoard.find((a) => a.id === bond.bId);
    if (!atomA || !atomB) return;

    const { x: x1, y: y1 } = atomA;
    const { x: x2, y: y2 } = atomB;

    if (bond.order === 1) {
      drawBondLine(x1, y1, x2, y2, 0);
    } else if (bond.order === 2) {
      // שני קווים מקבילים – קשר כפול
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.max(Math.hypot(dx, dy), 1);
      const nx = -dy / len;
      const ny = dx / len;
      const offset = 4;

      drawBondLine(x1 + nx * offset, y1 + ny * offset, x2 + nx * offset, y2 + ny * offset, 0);
      drawBondLine(x1 - nx * offset, y1 - ny * offset, x2 - nx * offset, y2 - ny * offset, 0);
    }
  });

  updateSelectionVisual();
}

function drawBondLine(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "rgba(75,85,99,0.95)");
  line.setAttribute("stroke-width", "3.2");
  line.setAttribute("stroke-linecap", "round");
  bondLayerEl.appendChild(line);
}

// ===== לוגיקת בחירה וחיבור =====

function handleAtomClick(atomId) {
  if (!selectedAtomId) {
    selectedAtomId = atomId;
    updateSelectionVisual();
    const atom = atomsOnBoard.find((a) => a.id === atomId);
    const atomDef = atom ? ATOM_MAP[atom.symbol] : null;
    if (atomDef) {
      showMessage(
        `בחרת את אטום ${atomDef.name_he}. כעת לחץ על אטום אחר כדי לחבר ביניהם.`,
        "neutral"
      );
    }
    return;
  }

  if (selectedAtomId === atomId) {
    selectedAtomId = null;
    updateSelectionVisual();
    showMessage("ביטלנו את הבחירה.", "neutral");
    return;
  }

  const aId = selectedAtomId;
  const bId = atomId;
  tryToggleBond(aId, bId);
}

function updateSelectionVisual() {
  const nodes = boardEl.querySelectorAll(".atom-node");
  nodes.forEach((node) => {
    const id = node.dataset.atomId;
    node.classList.toggle("selected", id === selectedAtomId);
  });
}

// כאן מתבצעת לוגיקת קשר יחיד / כפול:
//  - אין קשר → ניצור קשר מסדר 1
//  - יש קשר מסדר 1 → ננסה לשדרג לסדר 2 (אם יש "ידיים" פנויות)
//  - יש קשר מסדר 2 → נסיר את הקשר
function tryToggleBond(aId, bId) {
  const existing = bonds.find(
    (b) =>
      (b.aId === aId && b.bId === bId) || (b.aId === bId && b.bId === aId)
  );

  const atomA = atomsOnBoard.find((a) => a.id === aId);
  const atomB = atomsOnBoard.find((a) => a.id === bId);
  if (!atomA || !atomB) return;

  const defA = ATOM_MAP[atomA.symbol];
  const defB = ATOM_MAP[atomB.symbol];

  if (!existing) {
    // קשר חדש מסדר 1
    const usedA = getBondOrderSum(aId);
    const usedB = getBondOrderSum(bId);
    if (usedA >= defA.maxBonds || usedB >= defB.maxBonds) {
      selectedAtomId = null;
      flashAtomError([aId, bId]);
      const overAtom = usedA >= defA.maxBonds ? defA : defB;
      showMessage(
        `לא ניתן לחבר. לאטום ${overAtom.name_he} כבר אין ידיים פנויות.`,
        "error"
      );
      renderBoard();
      return;
    }

    bonds.push({
      id: "b" + bondIdCounter++,
      aId,
      bId,
      order: 1,
    });
    selectedAtomId = null;
    renderBoard();
    showMessage("יצרת קשר חדש בין שני האטומים.", "neutral");
    return;
  }

  // יש כבר קשר קיים
  if (existing.order === 1) {
    // ניסיון לשדרג לקשר כפול
    const usedA = getBondOrderSum(aId);
    const usedB = getBondOrderSum(bId);

    if (usedA + 1 > defA.maxBonds || usedB + 1 > defB.maxBonds) {
      // אין מספיק "ידיים" לעוד קשר
      selectedAtomId = null;
      flashAtomError([aId, bId]);
      const overAtom =
        usedA + 1 > defA.maxBonds ? defA : defB;
      showMessage(
        `אי אפשר ליצור עוד קשר ביניהם. לאטום ${overAtom.name_he} לא נשארות מספיק ידיים לקשר כפול.`,
        "error"
      );
      renderBoard();
      return;
    }

    existing.order = 2;
    selectedAtomId = null;
    renderBoard();
    showMessage("יצרת קשר כפול בין שני האטומים.", "neutral");
  } else {
    // order === 2 → מחיקה
    bonds = bonds.filter((b) => b !== existing);
    selectedAtomId = null;
    renderBoard();
    showMessage("הסרנו את הקשר בין האטומים.", "neutral");
  }
}

// ===== עזרי קשרים =====

// סכום סדרי הקשרים (למשל קשר כפול = 2)
function getBondOrderSum(atomId) {
  return bonds.reduce((sum, b) => {
    if (b.aId === atomId || b.bId === atomId) {
      return sum + (b.order || 1);
    }
    return sum;
  }, 0);
}

function flashAtomError(atomIds) {
  const nodes = boardEl.querySelectorAll(".atom-node");
  nodes.forEach((node) => {
    const id = node.dataset.atomId;
    if (atomIds.includes(id)) {
      node.classList.add("error");
      setTimeout(() => {
        node.classList.remove("error");
      }, 400);
    }
  });
}

function resetBoard() {
  atomsOnBoard = [];
  bonds = [];
  selectedAtomId = null;
  renderBoard();
  moleculeInfoEl.classList.add("hidden");
  moleculeInfoEl.innerHTML = "";
  showMessage("איפסנו את הלוח. תוכל להתחיל לבנות מולקולה חדשה.", "neutral");
}

// ===== בדיקת מולקולה + פריסת אטומים =====

function checkCurrentMolecule() {
  if (!atomsOnBoard.length) {
    showMessage("אין אטומים על הלוח. הוסף כמה אטומים קודם.", "error");
    return;
  }

  // בדיקת ידיים
  for (const atom of atomsOnBoard) {
    const def = ATOM_MAP[atom.symbol];
    const used = getBondOrderSum(atom.id);
    if (used > def.maxBonds) {
      flashAtomError([atom.id]);
      showMessage(
        `לאטום ${def.name_he} יש יותר מדי קשרים. זה לא אפשרי במציאות.`,
        "error"
      );
      moleculeInfoEl.classList.add("hidden");
      moleculeInfoEl.innerHTML = "";
      return;
    }
  }

  const counts = {};
  for (const atom of atomsOnBoard) {
    counts[atom.symbol] = (counts[atom.symbol] || 0) + 1;
  }

  const match = findMatchingMolecule(counts);

  if (match) {
    applyMoleculeLayout(match);
    renderBoard();

    showMessage(`כל הכבוד! בנית מולקולה מוכרת: ${match.name_he}.`, "success");
    showMoleculeInfo(match);
  } else {
    showMessage(
      "המולקולה שבנית עומדת בכללי הידיים, אבל היא לא אחת מהמולקולות המוכרות באפליקציה.",
      "neutral"
    );
    moleculeInfoEl.classList.add("hidden");
    moleculeInfoEl.innerHTML = "";
  }
}

function findMatchingMolecule(counts) {
  return KNOWN_MOLECULES.find((mol) => {
    const molCounts = mol.atomCounts;
    const symbolsInMol = Object.keys(molCounts);
    const symbolsInCurrent = Object.keys(counts);

    if (symbolsInMol.length !== symbolsInCurrent.length) return false;

    for (const symbol of symbolsInMol) {
      if (counts[symbol] !== molCounts[symbol]) return false;
    }
    return true;
  });
}

// פריסת אטומים “דומה למציאות” במרכז הלוח
function applyMoleculeLayout(mol) {
  const rect = boardEl.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const getAtoms = (symbol) =>
    atomsOnBoard.filter((a) => a.symbol === symbol);

  switch (mol.id) {
    case "water": {
      // H2O – צורת V
      const oAtoms = getAtoms("O");
      const hAtoms = getAtoms("H");
      if (oAtoms.length === 1 && hAtoms.length === 2) {
        const O = oAtoms[0];
        const [H1, H2] = hAtoms;
        O.x = cx;
        O.y = cy - 40;
        H1.x = cx - 60;
        H1.y = cy + 40;
        H2.x = cx + 60;
        H2.y = cy + 40;
      }
      break;
    }
    case "oxygen": {
      // O2 – קו ישר
      const oAtoms = getAtoms("O");
      if (oAtoms.length === 2) {
        oAtoms[0].x = cx - 60;
        oAtoms[0].y = cy;
        oAtoms[1].x = cx + 60;
        oAtoms[1].y = cy;
      }
      break;
    }
    case "carbon-dioxide": {
      // CO2 – קו ישר: O=C=O
      const cAtoms = getAtoms("C");
      const oAtoms = getAtoms("O");
      if (cAtoms.length === 1 && oAtoms.length === 2) {
        const C = cAtoms[0];
        const [O1, O2] = oAtoms;
        C.x = cx;
        C.y = cy;
        O1.x = cx - 90;
        O1.y = cy;
        O2.x = cx + 90;
        O2.y = cy;
      }
      break;
    }
    case "methane": {
      // CH4 – C במרכז, H בצורת צלב 2D
      const cAtoms = getAtoms("C");
      const hAtoms = getAtoms("H");
      if (cAtoms.length === 1 && hAtoms.length === 4) {
        const C = cAtoms[0];
        C.x = cx;
        C.y = cy;
        const r = 80;
        hAtoms[0].x = cx;
        hAtoms[0].y = cy - r;
        hAtoms[1].x = cx;
        hAtoms[1].y = cy + r;
        hAtoms[2].x = cx - r;
        hAtoms[2].y = cy;
        hAtoms[3].x = cx + r;
        hAtoms[3].y = cy;
      }
      break;
    }
    case "ammonia": {
      // NH3 – משולש של H מתחת ל-N
      const nAtoms = getAtoms("N");
      const hAtoms = getAtoms("H");
      if (nAtoms.length === 1 && hAtoms.length === 3) {
        const N = nAtoms[0];
        const [H1, H2, H3] = hAtoms;
        N.x = cx;
        N.y = cy - 40;
        H1.x = cx - 60;
        H1.y = cy + 40;
        H2.x = cx + 60;
        H2.y = cy + 40;
        H3.x = cx;
        H3.y = cy + 90;
      }
      break;
    }
    default:
      break;
  }
}

function showMoleculeInfo(mol) {
  moleculeInfoEl.classList.remove("hidden");
  moleculeInfoEl.innerHTML = `
    <div class="molecule-info-title">${mol.name_he}</div>
    <div class="molecule-info-formula">נוסחה: ${mol.formula}</div>
    <div class="molecule-info-text">${mol.expl_he}</div>
  `;
}

// ===== הודעות =====

function showMessage(text, type) {
  messageAreaEl.textContent = text;
  messageAreaEl.classList.remove("success", "error");
  if (type === "success") {
    messageAreaEl.classList.add("success");
  } else if (type === "error") {
    messageAreaEl.classList.add("error");
  }
}
