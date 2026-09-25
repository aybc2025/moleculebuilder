// איפה לשים אטום חדש: מקום פנוי קרוב לנקודת היעד (מרכז הלוח או אטום נבחר).

const STEP = 18;

export function findFreeSpot(atoms, width, height, near = null, minDist = 64) {
  const margin = 32;
  const cx = near ? near.x : width / 2;
  const cy = near ? near.y : height / 2;
  const startR = near ? minDist : 0;
  const clear = (x, y) =>
    x >= margin && x <= width - margin && y >= margin && y <= height - margin &&
    atoms.every((a) => Math.hypot(a.x - x, a.y - y) >= minDist);

  for (let r = startR; r < Math.max(width, height); r += STEP) {
    const steps = Math.max(1, Math.round((2 * Math.PI * r) / STEP));
    // מתחילים מלמעלה ומסתובבים, כדי שהמיקום יהיה צפוי
    for (let k = 0; k < steps; k++) {
      const t = -Math.PI / 2 + (k / steps) * 2 * Math.PI;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      if (clear(x, y)) return { x, y };
    }
  }
  return { x: width / 2, y: height / 2 };
}
