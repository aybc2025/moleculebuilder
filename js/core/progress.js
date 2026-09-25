// התקדמות: אילו מולקולות הילד בנה בעצמו. נשמר במכשיר בלבד.
// localStorage יכול להיות חסום (מצב פרטי) – אז פשוט עובדים בלי זיכרון.

const KEY = "mb.progress.v1";

function read() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data?.done) ? data.done.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

let done = new Set(read());

export const isDone = (id) => done.has(id);
export const doneCount = () => done.size;

/** מחזיר true אם זו הפעם הראשונה */
export function markDone(id) {
  if (done.has(id)) return false;
  done.add(id);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify({ done: [...done] }));
  } catch {
    /* אין אחסון – ממשיכים בלי לשמור */
  }
  return true;
}

export function readPref(key, fallback) {
  try {
    return globalThis.localStorage?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* ignore */
  }
}
