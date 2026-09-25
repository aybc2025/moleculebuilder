// האטומים שבמשחק. צבעים לפי מוסכמת CPK (כמו בערכות מודלים בבית הספר).
// hands = כמה קשרים האטום יכול להחזיק. lonePairs משמש לחישוב זוויות בתלת־ממד.
// covalent / vdw ביחידות אנגסטרם: לאורכי קשר ולמצב "מלא" בתלת־ממד.

export const ATOMS = {
  H: {
    symbol: "H", name: "מימן", hands: 1, lonePairs: 0,
    color: "#F7F7F4", ink: "#17263A", covalent: 0.31, vdw: 1.1,
    text: "למימן יש יד אחת. הוא האטום הקטן והנפוץ ביותר ביקום.",
  },
  C: {
    symbol: "C", name: "פחמן", hands: 4, lonePairs: 0,
    color: "#33373D", ink: "#FFFFFF", covalent: 0.76, vdw: 1.7,
    text: "לפחמן יש ארבע ידיים, והוא אוהב להתחבר להמון חברים. לכן הוא נמצא בכל דבר חי.",
  },
  N: {
    symbol: "N", name: "חנקן", hands: 3, lonePairs: 1,
    color: "#3563E0", ink: "#FFFFFF", covalent: 0.71, vdw: 1.55,
    text: "לחנקן יש שלוש ידיים. רוב האוויר שסביבנו עשוי ממנו.",
  },
  O: {
    symbol: "O", name: "חמצן", hands: 2, lonePairs: 2,
    color: "#E0393E", ink: "#FFFFFF", covalent: 0.66, vdw: 1.52,
    text: "לחמצן יש שתי ידיים. הוא מחזיק שני חברים, כמו במים.",
  },
  S: {
    symbol: "S", name: "גופרית", hands: 2, lonePairs: 2,
    color: "#E9C22E", ink: "#17263A", covalent: 1.05, vdw: 1.8,
    text: "לגופרית יש שתי ידיים, כמו לחמצן. היא אחראית להרבה ריחות חזקים.",
  },
  Cl: {
    symbol: "Cl", name: "כלור", hands: 1, lonePairs: 3,
    color: "#25994C", ink: "#FFFFFF", covalent: 1.02, vdw: 1.75,
    text: "לכלור יש יד אחת. בעזרתו מחטאים מים בבריכות.",
  },
};

export const ATOM_ORDER = ["H", "C", "N", "O", "S", "Cl"];
