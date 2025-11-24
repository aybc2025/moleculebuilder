// ===== נתוני בסיס: אטומים ומולקולות מוכרות =====

// כאן קל להוסיף אטומים חדשים בעתיד: פשוט להוסיף אובייקט חדש למערך ATOM_DEFS
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

// מולקולות מוכרות (זיהוי לפי ספירת אטומים)
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
    expl_he:
      "זאת מולקולת מתאן. זה גז שיכול לשמש כדלק.",
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

// מיפוי מהיר לפי symbol כדי לחפש מידע על אטומים
const ATOM_MAP = ATOM_DEFS.reduce((map, atom) => {
  map[atom.symbol] = atom;
  return map;
}, {});

// ===== מצב המשחק =====

let atomsOnBoard = []; // [{id, symbol, x, y}]
let bonds = []; // [{id, aId, bId}]
let atomIdCounter = 1;
let bondIdCounter = 1;
let selectedAtomId = null;

// אלמנטים מה-DOM
const boardEl = document.getElementById("board");
const bondLayerEl = document.getElementById("bond-layer");
const atomPaletteEl = document.getElementById("atom-palette");
const messageAreaEl = document.getElementById("message-area");
const moleculeInfoEl = document.getElementById("molecule-info");
const atomInfoListEl = document.getElementById("atom-info-list");

// ===== אתחול כללי =====

document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  buildAtomPalette();
  buildAtomInfoList();
  attachButtons();
});

// ===== ניהול מסכים (מצבים) =====

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
    if (screen.id === targetId) {
      screen.classList.add("active");
    } else {
      screen.classList.remove("active");
    }
  });
}

// ===== בניית סרגל אטומים =====

function buildAtomPalette() {
  // מנקים (אם נבנה שוב בעתיד)
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

// ===== כפתורי פעולה כלליים =====

function attachButtons() {
  const checkBtn = document.getElementById("btn-check-molecule");
  const resetBtn = document.getElementById("btn-reset-board");

  checkBtn.addEventListener("click", () => {
    checkCurrentMolecule();
  });

  resetBtn.addEventListener("click", () => {
    resetBoard();
  });
}

// ===== לוח עבודה: אטומים וקשרים =====

function addAtomToBoard(symbol) {
  const atomDef = ATOM_MAP[symbol];
  if (!atomDef) return;

  const rect = boardEl.getBoundingClientRect();

  // ממקמים אטום חדש במיקום חצי־אקראי בתוך הלוח
  const padding = 60;
  const x =
    Math.random() * (rect.width - padding * 2) +
    padding;
  const y =
    Math.random() * (rect.height - padding * 2) +
    padding;

  const atom = {
    id: "a" + atomIdCounter++,
    symbol,
    x,
    y,
  };
  atomsOnBoard.push(atom);
  renderBoard();

  showMessage(
    `הוספת אטום ${atomDef.name_he} ללוח.`,
    "neutral"
  );
}

function renderBoard() {
  // ניקוי כל האטומים הקיימים
  const existingNodes = boardEl.querySelectorAll(".atom-node");
  existingNodes.forEach((n) => n.remove());

  // ניקוי קשרים קיימים ב-SVG
  while (bondLayerEl.firstChild) {
    bondLayerEl.removeChild(bondLayerEl.firstChild);
  }

  // יצירת אטומים
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
    const usedBonds = getBondCount(atom.id);
    extraSpan.textContent = `${usedBonds}/${atomDef.maxBonds} ידיים`;

    node.appendChild(symbolSpan);
    node.appendChild(extraSpan);

    // הצבה
    node.style.left = `${atom.x - 26}px`;
    node.style.top = `${atom.y - 26}px`;

    node.addEventListener("click", (e) => {
      e.stopPropagation();
      handleAtomClick(atom.id);
    });

    // ניתן להוסיף גרירה עדינה בעתיד; לעכשיו, להשאיר קבוע
    // (כדי להוסיף גרירה: pointerdown + pointermove + pointerup על node)

    boardEl.appendChild(node);
  });

  // יצירת קווי קשרים
  bonds.forEach((bond) => {
    const atomA = atomsOnBoard.find((a) => a.id === bond.aId);
    const atomB = atomsOnBoard.find((a) => a.id === bond.bId);
    if (!atomA || !atomB) return;

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line.setAttribute("x1", atomA.x);
    line.setAttribute("y1", atomA.y);
    line.setAttribute("x2", atomB.x);
    line.setAttribute("y2", atomB.y);
    line.setAttribute("stroke", "rgba(226,232,240,0.9)");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");

    bondLayerEl.appendChild(line);
  });

  updateSelectionVisual();
}

function handleAtomClick(atomId) {
  if (!selectedAtomId) {
    // בחירת האטום הראשון
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
    // ביטול בחירה
    selectedAtomId = null;
    updateSelectionVisual();
    showMessage("ביטלנו את הבחירה.", "neutral");
    return;
  }

  // ניסוי חיבור בין שני האטומים
  const aId = selectedAtomId;
  const bId = atomId;
  tryToggleBond(aId, bId);
}

function updateSelectionVisual() {
  const nodes = boardEl.querySelectorAll(".atom-node");
  nodes.forEach((node) => {
    const id = node.dataset.atomId;
    if (id === selectedAtomId) {
      node.classList.add("selected");
    } else {
      node.classList.remove("selected");
    }
  });
}

// ניסיון להוסיף/להסיר קשר
function tryToggleBond(aId, bId) {
  // האם כבר יש קשר?
  const existing = bonds.find(
    (b) =>
      (b.aId === aId && b.bId === bId) ||
      (b.aId === bId && b.bId === aId)
  );

  if (existing) {
    // הסרת קשר
    bonds = bonds.filter((b) => b !== existing);
    selectedAtomId = null;
    renderBoard();
    showMessage("הסרנו את הקשר בין האטומים.", "neutral");
    return;
  }

  // קשר חדש: בדיקת ידיים
  const atomA = atomsOnBoard.find((a) => a.id === aId);
  const atomB = atomsOnBoard.find((a) => a.id === bId);
  if (!atomA || !atomB) return;

  const defA = ATOM_MAP[atomA.symbol];
  const defB = ATOM_MAP[atomB.symbol];

  const usedA = getBondCount(aId);
  const usedB = getBondCount(bId);

  if (usedA >= defA.maxBonds || usedB >= defB.maxBonds) {
    // חיבור לא אפשרי
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

  // יצירת קשר
  bonds.push({
    id: "b" + bondIdCounter++,
    aId,
    bId,
  });
  selectedAtomId = null;
  renderBoard();
  showMessage("יצרת קשר חדש בין שני האטומים.", "neutral");
}

function getBondCount(atomId) {
  return bonds.filter(
    (b) => b.aId === atomId || b.bId === atomId
  ).length;
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

// איפוס לוח
function resetBoard() {
  atomsOnBoard = [];
  bonds = [];
  selectedAtomId = null;
  renderBoard();
  moleculeInfoEl.classList.add("hidden");
  moleculeInfoEl.innerHTML = "";
  showMessage("איפסנו את הלוח. תוכל להתחיל לבנות מולקולה חדשה.", "neutral");
}

// ===== בדיקת המולקולה הנוכחית =====

function checkCurrentMolecule() {
  if (!atomsOnBoard.length) {
    showMessage("אין אטומים על הלוח. הוסף כמה אטומים קודם.", "error");
    return;
  }

  // 1. בדיקת "ידיים" לכל אטום
  for (const atom of atomsOnBoard) {
    const def = ATOM_MAP[atom.symbol];
    const used = getBondCount(atom.id);
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

  // 2. ספירת אטומים לפי סוג
  const counts = {};
  for (const atom of atomsOnBoard) {
    counts[atom.symbol] = (counts[atom.symbol] || 0) + 1;
  }

  // 3. ניסיון לזהות מולקולה מוכרת
  const match = findMatchingMolecule(counts);

  if (match) {
    showMessage(
      `כל הכבוד! בנית מולקולה מוכרת: ${match.name_he}.`,
      "success"
    );
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

    // חייב להיות אותו סט של סימולים
    if (symbolsInMol.length !== symbolsInCurrent.length) return false;

    for (const symbol of symbolsInMol) {
      if (counts[symbol] !== molCounts[symbol]) return false;
    }
    return true;
  });
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
