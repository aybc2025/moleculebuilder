// רישום ה־service worker ובאנר "יש גרסה חדשה". לא מרעננים בלי שהמשתמש לחץ.

const banner = document.getElementById("update-banner");
const reloadBtn = document.getElementById("update-reload");

function offer(worker) {
  banner.hidden = false;
  reloadBtn.onclick = () => {
    reloadBtn.disabled = true;
    worker.postMessage({ type: "SKIP_WAITING" });
  };
}

export function initUpdates() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("service-worker.js");
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) offer(worker);
        });
      });
      // בדיקה לעדכון כשחוזרים לאפליקציה
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) reg.update().catch(() => {});
      });
    } catch {
      /* בלי SW האפליקציה עדיין עובדת */
    }
  });
}
