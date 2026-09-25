// מעבר בין המסכים (tabs נגישים: חצים, Home/End).

const tabs = [...document.querySelectorAll('[role="tab"]')];

export function showScreen(screenId) {
  tabs.forEach((tab) => {
    const on = tab.getAttribute("aria-controls") === screenId;
    tab.setAttribute("aria-selected", String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !on;
  });
  window.scrollTo({ top: 0 });
}

export function initNav(onChange) {
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      showScreen(tab.getAttribute("aria-controls"));
      onChange?.(tab.getAttribute("aria-controls"));
    });
    tab.addEventListener("keydown", (e) => {
      // ב־RTL חץ שמאלה מתקדם קדימה
      const delta = { ArrowLeft: 1, ArrowRight: -1 }[e.key];
      let next = null;
      if (delta) next = tabs[(i + delta + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      next.click();
    });
  });
}
