// "חורי ידיים": נקודה לכל יד פנויה, בכיוונים שלא תפוסים על ידי קשרים.

/**
 * neighborAngles – זוויות (ברדיאנים) אל השכנים
 * free           – מספר הידיים הפנויות
 * מחזיר זוויות במעלות לנקודות
 */
export function pegAngles(neighborAngles, free) {
  if (free <= 0) return [];
  const total = neighborAngles.length + free;
  const step = (2 * Math.PI) / total;
  const base = neighborAngles.length ? neighborAngles[0] : -Math.PI / 2;
  const slots = Array.from({ length: total }, (_, k) => base + k * step);
  const taken = new Set();

  neighborAngles.forEach((angle) => {
    let best = -1;
    let bestDiff = Infinity;
    slots.forEach((slot, k) => {
      if (taken.has(k)) return;
      const diff = Math.abs(Math.atan2(Math.sin(slot - angle), Math.cos(slot - angle)));
      if (diff < bestDiff) { bestDiff = diff; best = k; }
    });
    taken.add(best);
  });

  return slots
    .filter((_, k) => !taken.has(k))
    .map((rad) => (rad * 180) / Math.PI);
}
