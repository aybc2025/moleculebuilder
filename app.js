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

// מולקולות מוכרות – משמש גם להצגה וגם לאתגרים
const KNOWN_MOLECULES = [
  {
    id: "water",
    name_he: "מים",
    formula: "H₂O",
    atomCounts: { H: 2, O: 1 },
    expl_he:
      "זאת מולקולת מים. יש בה שני אטומי מימן ואטום חמצן אחד. המים הם מה שאנחנו שותים, שוחים בהם ומתקלחים בהם."
  },

  {
    id: "oxygen",
    name_he: "חמצן נשימתי",
    formula: "O₂",
    atomCounts: { O: 2 },
    expl_he:
      "פה יש מולקולה של חמצן עם שני אטומי חמצן מחוברים בקשר כפול. זה הגז שאנו נושמים מהאוויר."
  },

  {
    id: "hydrogen-gas",
    name_he: "מימן גזי",
    formula: "H₂",
    atomCounts: { H: 2 },
    expl_he:
      "זאת מולקולה של גז מימן. שני אטומי מימן מחזיקים ידיים אחד עם השני ויוצרים גז קל מאוד."
  },

  {
    id: "hydrogen-peroxide",
    name_he: "מי חמצן",
    formula: "H₂O₂",
    atomCounts: { H: 2, O: 2 },
    expl_he:
      "זאת מולקולת מי חמצן. שני אטומי חמצן מחוברים אחד לשני, ולכל אחד מהם מחובר אטום מימן. משתמשים במי חמצן לפעמים לחיטוי."
  },

  {
    id: "carbon-dioxide",
    name_he: "פחמן דו־חמצני",
    formula: "CO₂",
    atomCounts: { C: 1, O: 2 },
    expl_he:
      "זאת מולקולת פחמן דו־חמצני. יש בה אטום פחמן אחד ושני אטומי חמצן. אנו נושפים אותה החוצה כשאנחנו נושמים."
  },

  {
    id: "methane",
    name_he: "מתאן",
    formula: "CH₄",
    atomCounts: { C: 1, H: 4 },
    expl_he:
      "זאת מולקולת מתאן. הפחמן נמצא באמצע ומחובר לארבעה אטומי מימן. מתאן הוא גז שיכול לשמש כדלק."
  },

  {
    id: "ammonia",
    name_he: "אמוניה",
    formula: "NH₃",
    atomCounts: { N: 1, H: 3 },
    expl_he:
      "זאת מולקולת אמוניה. אטום חנקן מחזיק שלושה אטומי מימן. משתמשים באמוניה לפעמים בחומרי ניקוי."
  },

  {
    id: "formaldehyde",
    name_he: "פורמלדהיד",
    formula: "CH₂O",
    atomCounts: { C: 1, H: 2, O: 1 },
    expl_he:
      "זאת מולקולת פורמלדהיד. הפחמן מחובר לשני מימנים ולקשר כפול עם חמצן. מולקולה זו נמצאת לפעמים בחומרים תעשייתיים."
  },

  {
    id: "ethane",
    name_he: "אתאן",
    formula: "C₂H₆",
    atomCounts: { C: 2, H: 6 },
    expl_he:
      "זאת מולקולת אתאן. שני אטומי פחמן מחוברים זה לזה, וכל אחד מחזיק שלושה אטומי מימן. מולקולה פשוטה ששייכת למשפחת הגזים."
  },

  {
    id: "methanol",
    name_he: "מתנול",
    formula: "CH₃OH",
    atomCounts: { C: 1, H: 4, O: 1 },
    expl_he:
      "זאת מולקולת מתנול — אלכוהול פשוט. הפחמן מחובר לשלושה מימנים ולחמצן, והחמצן מחובר למימן נוסף."
  }
];

// מודלים פשוטים לתצוגה תלת־מימדית של המולקולות המוכרות
const MOLECULE_3D_MODELS = {
  water: {
    atoms: [
      { symbol: "O", position: [0, 0, 0] },
      { symbol: "H", position: [1.3, 0.8, 0] },
      { symbol: "H", position: [-1.3, 0.8, 0] }
    ],
    bonds: [
      [0, 1, 1],
      [0, 2, 1]
    ]
  },

  oxygen: {
    atoms: [
      { symbol: "O", position: [-1.2, 0, 0] },
      { symbol: "O", position: [1.2, 0, 0] }
    ],
    bonds: [[0, 1, 2]]
  },

  "hydrogen-gas": {
    atoms: [
      { symbol: "H", position: [-1.2, 0, 0] },
      { symbol: "H", position: [1.2, 0, 0] }
    ],
    bonds: [[0, 1, 1]]
  },

  "hydrogen-peroxide": {
    atoms: [
      { symbol: "H", position: [-2.4, 0, 0] },
      { symbol: "O", position: [-0.8, 0, 0] },
      { symbol: "O", position: [0.8, 0, 0] },
      { symbol: "H", position: [2.4, 0, 0] }
    ],
    bonds: [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1]
    ]
  },

  "carbon-dioxide": {
    atoms: [
      { symbol: "O", position: [-2.0, 0, 0] },
      { symbol: "C", position: [0, 0, 0] },
      { symbol: "O", position: [2.0, 0, 0] }
    ],
    bonds: [
      [0, 1, 2],
      [1, 2, 2]
    ]
  },

  methane: {
    atoms: [
      { symbol: "C", position: [0, 0, 0] },
      { symbol: "H", position: [1.4, 1.4, 0] },
      { symbol: "H", position: [-1.4, 1.4, 0] },
      { symbol: "H", position: [-1.4, -1.4, 0] },
      { symbol: "H", position: [1.4, -1.4, 0] }
    ],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1]
    ]
  },

  ammonia: {
    atoms: [
      { symbol: "N", position: [0, 0.6, 0] },
      { symbol: "H", position: [1.4, -0.6, 0] },
      { symbol: "H", position: [-1.4, -0.6, 0] },
      { symbol: "H", position: [0, -1.6, 0] }
    ],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1]
    ]
  },

  formaldehyde: {
    atoms: [
      { symbol: "C", position: [0, 0, 0] },
      { symbol: "O", position: [0, 2.0, 0] },
      { symbol: "H", position: [-1.6, -1.2, 0] },
      { symbol: "H", position: [1.6, -1.2, 0] }
    ],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
      [0, 3, 1]
    ]
  },

  ethane: {
    atoms: [
      { symbol: "C", position: [-1.0, 0, 0] },
      { symbol: "C", position: [1.0, 0, 0] },

      { symbol: "H", position: [-2.4, 1.2, 0] },
      { symbol: "H", position: [-2.4, -1.2, 0] },
      { symbol: "H", position: [-1.0, 0, 1.8] },

      { symbol: "H", position: [2.4, 1.2, 0] },
      { symbol: "H", position: [2.4, -1.2, 0] },
      { symbol: "H", position: [1.0, 0, -1.8] }
    ],
    bonds: [
      [0, 1, 1],

      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1],

      [1, 5, 1],
      [1, 6, 1],
      [1, 7, 1]
    ]
  },

  methanol: {
    atoms: [
      { symbol: "C", position: [0, 0, 0] },
      { symbol: "O", position: [0, 2.0, 0] },
      { symbol: "H", position: [0, 3.4, 0] },
      { symbol: "H", position: [-1.8, -1.2, 0] },
      { symbol: "H", position: [1.8, -1.2, 0] },
      { symbol: "H", position: [0, -2.0, 0] }
    ],
    bonds: [
      [0, 1, 1],
      [1, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
      [0, 5, 1]
    ]
  }
};

const ATOM_MAP = ATOM_DEFS.reduce((map, atom) => {
  map[atom.symbol] = atom;
  return map;
}, {});

// ===== מצב המשחק =====

let atomsOnBoard = []; // [{id, symbol, x, y}]
let bonds = [];        // [{id, aId, bId, order}]
let atomIdCounter = 1;
let bondIdCounter = 1;
let selectedAtomId = null;

// אתגר נוכחי (אם יש)
let currentChallenge = null;

// מצב גרירה
let dragState = {
  atomId: null,
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
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
const challengeListEl = document.getElementById("challenge-list");
const activeChallengeBannerEl = document.getElementById("active-challenge-banner");
const viewer3dCanvas = document.getElementById("viewer3d-canvas");
const viewer3dCardEl = document.getElementById("viewer3d-card");

// ===== אתחול =====

document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  buildAtomPalette();
  buildAtomInfoList();
  buildChallengeList();
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

// ===== מידע על אטומים =====

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

// ===== רשימת אתגרים / מולקולות =====

function buildChallengeList() {
  challengeListEl.innerHTML = "";

  KNOWN_MOLECULES.forEach((mol) => {
    const card = document.createElement("div");
    card.className = "challenge-card";

    const header = document.createElement("div");
    header.className = "challenge-header";

    const titleBox = document.createElement("div");
    const title = document.createElement("div");
    title.className = "challenge-title";
    title.textContent = mol.name_he;

    const formula = document.createElement("div");
    formula.className = "challenge-formula";
    formula.textContent = `נוסחה: ${mol.formula}`;

    titleBox.appendChild(title);
    titleBox.appendChild(formula);
    header.appendChild(titleBox);

    const desc = document.createElement("div");
    desc.className = "challenge-desc";
    desc.textContent = mol.expl_he;

    const actions = document.createElement("div");
    actions.className = "challenge-actions";

    const showBtn = document.createElement("button");
    showBtn.type = "button";
    showBtn.className = "secondary-btn";
    showBtn.textContent = "הצג מולקולה";
    showBtn.addEventListener("click", () => {
      // קודם מעבירים למסך המשחק החופשי
      switchScreen("screen-freeplay");
      // ואז בפריים הבא מחשבים פריסה – הלוח כבר גלוי ויש לו רוחב/גובה
      requestAnimationFrame(() => {
        showMoleculeSample(mol);
      });
    });

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "primary-btn";
    startBtn.textContent = "התחל אתגר";
    startBtn.addEventListener("click", () => {
      switchScreen("screen-freeplay");
      startChallenge(mol);
    });

    actions.appendChild(showBtn);
    actions.appendChild(startBtn);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(actions);

    challengeListEl.appendChild(card);
  });
}

function startChallenge(mol) {
  currentChallenge = mol;
  updateActiveChallengeBanner();

  // איפוס לוח בלי הודעת "איפסנו" הסטנדרטית
  atomsOnBoard = [];
  bonds = [];
  selectedAtomId = null;
  renderBoard();
  moleculeInfoEl.classList.add("hidden");
  moleculeInfoEl.innerHTML = "";

  showMessage(
    `אתגר: נסו לבנות את המולקולה "${mol.name_he}" (נוסחה: ${mol.formula}). השתמשו באטומים והקשרים הנכונים.`,
    "neutral"
  );
}

function updateActiveChallengeBanner() {
  if (!activeChallengeBannerEl) return;
  if (currentChallenge) {
    activeChallengeBannerEl.classList.remove("hidden");
    activeChallengeBannerEl.textContent = `אתגר פעיל: בנו את המולקולה "${currentChallenge.name_he}" (${currentChallenge.formula}).`;
  } else {
    activeChallengeBannerEl.classList.add("hidden");
    activeChallengeBannerEl.textContent = "";
  }
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

  boardEl.addEventListener("click", () => {
    selectedAtomId = null;
    updateSelectionVisual();
  });
}

// ===== לוח עבודה, גרירה וקשרים =====

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

    // קליק לחיבור
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      handleAtomClick(atom.id);
    });

    // גרירה
    node.addEventListener("pointerdown", (e) => {
  e.stopPropagation();
  const rect = boardEl.getBoundingClientRect();
  const pointerX = e.clientX - rect.left;
  const pointerY = e.clientY - rect.top;

  dragState.atomId = atom.id;
  dragState.offsetX = atom.x - pointerX;
  dragState.offsetY = atom.y - pointerY;
  dragState.startX = atom.x;  // נשמור מאיפה התחלנו
  dragState.startY = atom.y;
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

  const r = 26;
  newX = Math.max(r, Math.min(rect.width - r, newX));
  newY = Math.max(r, Math.min(rect.height - r, newY));

  atom.x = newX;
  atom.y = newY;

  // לבדוק אם זזנו "באמת" (יותר מכמה פיקסלים)
  const dx = atom.x - dragState.startX;
  const dy = atom.y - dragState.startY;
  if (!dragState.moved) {
    const distSq = dx * dx + dy * dy;
    const DRAG_THRESHOLD_SQ = 5 * 5; // ~5px
    if (distSq > DRAG_THRESHOLD_SQ) {
      dragState.moved = true;
    }
  }

  renderBoard();
});
    
    node.addEventListener("pointerup", (e) => {
      if (dragState.atomId === atom.id) {
        node.releasePointerCapture(e.pointerId);
        if (dragState.moved) {
          suppressNextClick = true;
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

  // קשרים
  bonds.forEach((bond) => {
    const atomA = atomsOnBoard.find((a) => a.id === bond.aId);
    const atomB = atomsOnBoard.find((a) => a.id === bond.bId);
    if (!atomA || !atomB) return;

    const { x: x1, y: y1 } = atomA;
    const { x: x2, y: y2 } = atomB;

    if (bond.order === 1) {
      drawBondLine(x1, y1, x2, y2);
    } else if (bond.order === 2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.max(Math.hypot(dx, dy), 1);
      const nx = -dy / len;
      const ny = dx / len;
      const offset = 4;

      drawBondLine(x1 + nx * offset, y1 + ny * offset, x2 + nx * offset, y2 + ny * offset);
      drawBondLine(x1 - nx * offset, y1 - ny * offset, x2 - nx * offset, y2 - ny * offset);
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

// ===== בחירה וחיבור =====

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

// אין קשר → קשר 1; קשר 1 → קשר כפול; קשר כפול → מחיקה
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

  if (existing.order === 1) {
    const usedA = getBondOrderSum(aId);
    const usedB = getBondOrderSum(bId);

    if (usedA + 1 > defA.maxBonds || usedB + 1 > defB.maxBonds) {
      selectedAtomId = null;
      flashAtomError([aId, bId]);
      const overAtom = usedA + 1 > defA.maxBonds ? defA : defB;
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
    bonds = bonds.filter((b) => b !== existing);
    selectedAtomId = null;
    renderBoard();
    showMessage("הסרנו את הקשר בין האטומים.", "neutral");
  }
}

// סכום סדרי הקשרים של אטום
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
  // האתגר נשאר פעיל אם היה
}

// ===== בדיקת מולקולה =====

function checkCurrentMolecule() {
  if (!atomsOnBoard.length) {
    showMessage("אין אטומים על הלוח. הוסף כמה אטומים קודם.", "error");
    return;
  }

  // בדיקת "ידיים" לכל אטום
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

  // ספירת אטומים לפי סוג
  const counts = {};
  for (const atom of atomsOnBoard) {
    counts[atom.symbol] = (counts[atom.symbol] || 0) + 1;
  }

  const match = findMatchingMolecule(counts);

  // אם יש אתגר פעיל – מתייחסים אליו קודם
  if (currentChallenge) {
    if (!match) {
      showMessage(
        `אתגר: עדיין לא בנית את "${currentChallenge.name_he}". נסה שוב לחבר את האטומים.`,
        "error"
      );
      moleculeInfoEl.classList.add("hidden");
      moleculeInfoEl.innerHTML = "";
      return;
    }

    if (match.id !== currentChallenge.id) {
      showMessage(
        `בנית מולקולה מוכרת (${match.name_he}), אבל זו לא המולקולה של האתגר (${currentChallenge.name_he}).`,
        "neutral"
      );
      showMoleculeInfo(match);
      renderMolecule3D(match);
      return;
    }

    // הצלחה באתגר
    applyMoleculeLayout(match);
    renderBoard();
    showMessage(
      `כל הכבוד! הצלחת באתגר ובנית את המולקולה "${match.name_he}".`,
      "success"
    );
    showMoleculeInfo(match);
    renderMolecule3D(match);
    currentChallenge = null;
    updateActiveChallengeBanner();
    return;
  }

  // בלי אתגר – סתם בדיקה
  if (match) {
    applyMoleculeLayout(match);
    renderBoard();
    showMessage(
      `כל הכבוד! בנית מולקולה מוכרת: ${match.name_he}.`,
      "success"
    );
    showMoleculeInfo(match);
    renderMolecule3D(match);
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

// ===== הצגת מולקולה מוכנה (לדרישת הילד) =====

function showMoleculeSample(mol) {
  atomsOnBoard = [];
  bonds = [];
  selectedAtomId = null;

  // יוצרים אטומים בלי תלות במיקום – המיקום יקבע ב-applyMoleculeLayout
  Object.entries(mol.atomCounts).forEach(([symbol, count]) => {
    for (let i = 0; i < count; i++) {
      atomsOnBoard.push({
        id: "a" + atomIdCounter++,
        symbol,
        x: 0,
        y: 0,
      });
    }
  });

  setupDemoBondsForMolecule(mol);
    applyMoleculeLayout(mol);
  renderBoard();
  showMoleculeInfo(mol);
  renderMolecule3D(mol);
  showMessage(`מציגים דוגמה של המולקולה "${mol.name_he}".`, "neutral");
}

function getAtomsBySymbol(symbol) {
  return atomsOnBoard.filter((a) => a.symbol === symbol);
}

function setupDemoBondsForMolecule(mol) {
  bonds = [];

  const Hs = getAtomsBySymbol("H");
  const Os = getAtomsBySymbol("O");
  const Cs = getAtomsBySymbol("C");
  const Ns = getAtomsBySymbol("N");

  switch (mol.id) {
    // מים H2O
    case "water": {
      if (Os.length === 1 && Hs.length === 2) {
        const O = Os[0];
        const [H1, H2] = Hs;
        bonds.push(
          { id: "b" + bondIdCounter++, aId: O.id, bId: H1.id, order: 1 },
          { id: "b" + bondIdCounter++, aId: O.id, bId: H2.id, order: 1 }
        );
      }
      break;
    }

    // חמצן נשימתי O2
    case "oxygen": {
      if (Os.length === 2) {
        bonds.push({
          id: "b" + bondIdCounter++,
          aId: Os[0].id,
          bId: Os[1].id,
          order: 2
        });
      }
      break;
    }

    // מימן גזי H2
    case "hydrogen-gas": {
      if (Hs.length === 2) {
        bonds.push({
          id: "b" + bondIdCounter++,
          aId: Hs[0].id,
          bId: Hs[1].id,
          order: 1
        });
      }
      break;
    }

    // מי חמצן H2O2 : H–O–O–H
    case "hydrogen-peroxide": {
      if (Hs.length === 2 && Os.length === 2) {
        const [H1, H2] = Hs;
        const [O1, O2] = Os;
        bonds.push(
          { id: "b" + bondIdCounter++, aId: H1.id, bId: O1.id, order: 1 },
          { id: "b" + bondIdCounter++, aId: O1.id, bId: O2.id, order: 1 },
          { id: "b" + bondIdCounter++, aId: O2.id, bId: H2.id, order: 1 }
        );
      }
      break;
    }

    // פחמן דו־חמצני CO2 : O=C=O (שני קשרים כפולים)
    case "carbon-dioxide": {
      if (Cs.length === 1 && Os.length === 2) {
        const C = Cs[0];
        const [O1, O2] = Os;
        bonds.push(
          { id: "b" + bondIdCounter++, aId: C.id, bId: O1.id, order: 2 },
          { id: "b" + bondIdCounter++, aId: C.id, bId: O2.id, order: 2 }
        );
      }
      break;
    }

    // מתאן CH4
    case "methane": {
      if (Cs.length === 1 && Hs.length === 4) {
        const C = Cs[0];
        Hs.forEach((H) => {
          bonds.push({
            id: "b" + bondIdCounter++,
            aId: C.id,
            bId: H.id,
            order: 1
          });
        });
      }
      break;
    }

    // אמוניה NH3
    case "ammonia": {
      if (Ns.length === 1 && Hs.length === 3) {
        const N = Ns[0];
        Hs.forEach((H) => {
          bonds.push({
            id: "b" + bondIdCounter++,
            aId: N.id,
            bId: H.id,
            order: 1
          });
        });
      }
      break;
    }

    // פורמלדהיד CH2O : C מחובר לשני H ולקשר כפול ל-O
    case "formaldehyde": {
      if (Cs.length === 1 && Hs.length === 2 && Os.length === 1) {
        const C = Cs[0];
        const [H1, H2] = Hs;
        const O = Os[0];
        bonds.push(
          { id: "b" + bondIdCounter++, aId: C.id, bId: H1.id, order: 1 },
          { id: "b" + bondIdCounter++, aId: C.id, bId: H2.id, order: 1 },
          { id: "b" + bondIdCounter++, aId: C.id, bId: O.id, order: 2 }
        );
      }
      break;
    }

    // אתאן C2H6 : שני פחמנים מחוברים, וכל אחד ל-3 H
    case "ethane": {
      if (Cs.length === 2 && Hs.length === 6) {
        const [C1, C2] = Cs;
        const [H1, H2, H3, H4, H5, H6] = Hs;

        // קשר בין C1 ל-C2
        bonds.push({
          id: "b" + bondIdCounter++,
          aId: C1.id,
          bId: C2.id,
          order: 1
        });

        // שלושה H על כל פחמן
        [H1, H2, H3].forEach((H) => {
          bonds.push({
            id: "b" + bondIdCounter++,
            aId: C1.id,
            bId: H.id,
            order: 1
          });
        });
        [H4, H5, H6].forEach((H) => {
          bonds.push({
            id: "b" + bondIdCounter++,
            aId: C2.id,
            bId: H.id,
            order: 1
          });
        });
      }
      break;
    }

    // מתנול CH3OH : C–(3H)–O–H
    case "methanol": {
      if (Cs.length === 1 && Os.length === 1 && Hs.length === 4) {
        const C = Cs[0];
        const O = Os[0];
        const [H1, H2, H3, H4] = Hs;

        // שלושת המימנים של הפחמן
        [H1, H2, H3].forEach((H) => {
          bonds.push({
            id: "b" + bondIdCounter++,
            aId: C.id,
            bId: H.id,
            order: 1
          });
        });

        // קשר C–O
        bonds.push({
          id: "b" + bondIdCounter++,
          aId: C.id,
          bId: O.id,
          order: 1
        });

        // קשר O–H
        bonds.push({
          id: "b" + bondIdCounter++,
          aId: O.id,
          bId: H4.id,
          order: 1
        });
      }
      break;
    }

    default:
      break;
  }
}

// ===== פריסת אטומים במבנה דומה למציאות =====

function applyMoleculeLayout(mol) {
  const rect = boardEl.getBoundingClientRect();
  const width = rect.width || boardEl.clientWidth || 400;
  const height = rect.height || boardEl.clientHeight || 260;
  const cx = width / 2;
  const cy = height / 2;

  const getAtoms = (symbol) => atomsOnBoard.filter((a) => a.symbol === symbol);

  switch (mol.id) {
    // מים H2O
    case "water": {
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

    // חמצן נשימתי O2
    case "oxygen": {
      const oAtoms = getAtoms("O");
      if (oAtoms.length === 2) {
        oAtoms[0].x = cx - 60;
        oAtoms[0].y = cy;
        oAtoms[1].x = cx + 60;
        oAtoms[1].y = cy;
      }
      break;
    }

    // מימן גזי H2
    case "hydrogen-gas": {
      const hAtoms = getAtoms("H");
      if (hAtoms.length === 2) {
        hAtoms[0].x = cx - 60;
        hAtoms[0].y = cy;
        hAtoms[1].x = cx + 60;
        hAtoms[1].y = cy;
      }
      break;
    }

    // מי חמצן H2O2 : H–O–O–H
    case "hydrogen-peroxide": {
      const hAtoms = getAtoms("H");
      const oAtoms = getAtoms("O");
      if (hAtoms.length === 2 && oAtoms.length === 2) {
        const [H1, H2] = hAtoms;
        const [O1, O2] = oAtoms;
        const spacing = 60;

        O1.x = cx - spacing;
        O1.y = cy;
        O2.x = cx + spacing;
        O2.y = cy;

        H1.x = cx - spacing * 2;
        H1.y = cy;
        H2.x = cx + spacing * 2;
        H2.y = cy;
      }
      break;
    }

    // פחמן דו־חמצני CO2 : O=C=O
    case "carbon-dioxide": {
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

    // מתאן CH4 : צלב 2D
    case "methane": {
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

    // אמוניה NH3 : N למעלה, משולש של H מתחת
    case "ammonia": {
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

    // פורמלדהיד CH2O : C באמצע, O למעלה, שני H למטה
    case "formaldehyde": {
      const cAtoms = getAtoms("C");
      const hAtoms = getAtoms("H");
      const oAtoms = getAtoms("O");
      if (cAtoms.length === 1 && hAtoms.length === 2 && oAtoms.length === 1) {
        const C = cAtoms[0];
        const [H1, H2] = hAtoms;
        const O = oAtoms[0];

        C.x = cx;
        C.y = cy;
        O.x = cx;
        O.y = cy - 80;
        H1.x = cx - 60;
        H1.y = cy + 70;
        H2.x = cx + 60;
        H2.y = cy + 70;
      }
      break;
    }

    // אתאן C2H6 : C–C באמצע, סביב כל C שלושה H
    case "ethane": {
      const cAtoms = getAtoms("C");
      const hAtoms = getAtoms("H");
      if (cAtoms.length === 2 && hAtoms.length === 6) {
        const [C1, C2] = cAtoms;
        const [H1, H2, H3, H4, H5, H6] = hAtoms;

        const dx = 90;

        C1.x = cx - dx / 2;
        C1.y = cy;
        C2.x = cx + dx / 2;
        C2.y = cy;

        // סביב C1
        H1.x = C1.x;
        H1.y = C1.y - 70;
        H2.x = C1.x - 70;
        H2.y = C1.y + 40;
        H3.x = C1.x + 70;
        H3.y = C1.y + 40;

        // סביב C2
        H4.x = C2.x;
        H4.y = C2.y - 70;
        H5.x = C2.x - 70;
        H5.y = C2.y + 40;
        H6.x = C2.x + 70;
        H6.y = C2.y + 40;
      }
      break;
    }

    // מתנול CH3OH : C במרכז, 3 H מסביבו, O בצד עם H מחובר
    case "methanol": {
      const cAtoms = getAtoms("C");
      const hAtoms = getAtoms("H");
      const oAtoms = getAtoms("O");
      if (cAtoms.length === 1 && hAtoms.length === 4 && oAtoms.length === 1) {
        const C = cAtoms[0];
        const O = oAtoms[0];
        const [H1, H2, H3, H4] = hAtoms;

        C.x = cx - 40;
        C.y = cy;

        // שלושת המימנים של הפחמן
        H1.x = C.x;
        H1.y = C.y - 70;
        H2.x = C.x - 70;
        H2.y = C.y + 40;
        H3.x = C.x + 70;
        H3.y = C.y + 40;

        // קבוצת OH בצד ימין
        O.x = cx + 60;
        O.y = cy;
        H4.x = O.x + 70;
        H4.y = O.y;
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

// ===== תצוגה תלת־מימדית של מולקולות =====

let threeInitialized = false;
let threeScene = null;
let threeCamera = null;
let threeRenderer = null;
let threeControls = null;
let threeAtomMeshes = [];
let threeBondMeshes = [];

const ATOM_RADIUS_3D = {
  H: 0.35,
  C: 0.55,
  N: 0.55,
  O: 0.5
};

function getAtomColor3D(symbol) {
  const def = ATOM_MAP[symbol];
  return (def && def.color) || "#9ca3af";
}

function init3DViewer() {
  if (!viewer3dCanvas || !window.THREE) {
    return;
  }
  const parent = viewer3dCanvas.parentElement || viewer3dCanvas;
  const width = parent.clientWidth || 320;
  const height = parent.clientHeight || 260;

  threeRenderer = new THREE.WebGLRenderer({
    canvas: viewer3dCanvas,
    antialias: true,
    alpha: true
  });
  threeRenderer.setPixelRatio(window.devicePixelRatio || 1);
  threeRenderer.setSize(width, height, false);

  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0xf3f4f6);

  const aspect = width / height;
  threeCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  threeCamera.position.set(0, 0, 14);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
  hemi.position.set(0, 20, 0);
  threeScene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  threeScene.add(dir);

  if (THREE.OrbitControls) {
    threeControls = new THREE.OrbitControls(threeCamera, viewer3dCanvas);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.1;
    threeControls.rotateSpeed = 0.8;
  }

  window.addEventListener("resize", handle3DResize);
  threeInitialized = true;
  animate3D();
}

function handle3DResize() {
  if (!threeInitialized || !threeRenderer || !threeCamera) return;
  const parent = viewer3dCanvas.parentElement || viewer3dCanvas;
  const width = parent.clientWidth || 320;
  const height = parent.clientHeight || 260;

  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(width, height, false);
}

function animate3D() {
  if (!threeInitialized || !threeRenderer || !threeScene || !threeCamera) return;
  requestAnimationFrame(animate3D);
  if (threeControls) {
    threeControls.update();
  }
  threeRenderer.render(threeScene, threeCamera);
}

function clear3DScene() {
  if (!threeScene) return;
  threeAtomMeshes.forEach((m) => threeScene.remove(m));
  threeBondMeshes.forEach((m) => threeScene.remove(m));
  threeAtomMeshes = [];
  threeBondMeshes = [];
}

function createBondCylinder(start, end, radius) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const geom = new THREE.CylinderGeometry(radius, radius, length, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x374151 });

  const mesh = new THREE.Mesh(geom, mat);

  // ממקמים במרכז בין שתי הנקודות
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mesh.position.copy(mid);

  // מסובבים לציר המתאים
  const axis = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(axis, dir.clone().normalize());

  return mesh;
}

function renderMolecule3D(mol) {
  if (!viewer3dCanvas || !window.THREE || !MOLECULE_3D_MODELS) return;

  const model = MOLECULE_3D_MODELS[mol.id] || MOLECULE_3D_MODELS[mol.id && mol.id.toString()];
  if (!model) {
    if (viewer3dCardEl) viewer3dCardEl.classList.add("hidden");
    return;
  }

  if (viewer3dCardEl) viewer3dCardEl.classList.remove("hidden");

  if (!threeInitialized) {
    init3DViewer();
    if (!threeInitialized) return;
  }

  clear3DScene();

  // יצירת אטומים
  threeAtomMeshes = model.atoms.map((atomDef) => {
    const [x, y, z] = atomDef.position;
    const radius = ATOM_RADIUS_3D[atomDef.symbol] || 0.4;
    const geom = new THREE.SphereGeometry(radius, 32, 32);
    const color = new THREE.Color(getAtomColor3D(atomDef.symbol));
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.0 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    threeScene.add(mesh);
    return mesh;
  });

  // יצירת קשרים
  threeBondMeshes = [];
  model.bonds.forEach((bond) => {
    const [aIndex, bIndex, order] = bond;
    const a = threeAtomMeshes[aIndex];
    const b = threeAtomMeshes[bIndex];
    if (!a || !b) return;

    const baseStart = a.position.clone();
    const baseEnd = b.position.clone();

    const bondCount = order === 3 ? 3 : order === 2 ? 2 : 1;
    const offsetDir = new THREE.Vector3().subVectors(baseEnd, baseStart).cross(new THREE.Vector3(0, 1, 0));
    if (offsetDir.lengthSq() === 0) {
      offsetDir.set(1, 0, 0);
    }
    offsetDir.normalize().multiplyScalar(0.15);

    for (let i = 0; i < bondCount; i++) {
      const t = bondCount === 1 ? 0 : i - (bondCount - 1) / 2;
      const start = baseStart.clone().add(offsetDir.clone().multiplyScalar(t));
      const end = baseEnd.clone().add(offsetDir.clone().multiplyScalar(t));
      const bondMesh = createBondCylinder(start, end, 0.12);
      threeScene.add(bondMesh);
      threeBondMeshes.push(bondMesh);
    }
  });

  // ממרכזים את המצלמה
  if (threeControls) {
    threeControls.target.set(0, 0, 0);
    threeControls.update();
  }
}
