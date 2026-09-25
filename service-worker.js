// מעלים את VERSION בכל שינוי בקבצים – זה מה שמפעיל את באנר "יש גרסה חדשה".
const VERSION = "2.0.0";
const CACHE = `molecule-builder-${VERSION}`;

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/board.css",
  "./css/screens.css",
  "./js/main.js",
  "./js/data/atoms.js",
  "./js/data/molecules.js",
  "./js/data/molecules-easy.js",
  "./js/data/molecules-medium.js",
  "./js/data/molecules-hard.js",
  "./js/core/chemistry.js",
  "./js/core/geometry3d.js",
  "./js/core/layout2d.js",
  "./js/core/match.js",
  "./js/core/placement.js",
  "./js/core/progress.js",
  "./js/core/store.js",
  "./js/ui/atomsScreen.js",
  "./js/ui/board.js",
  "./js/ui/boardInput.js",
  "./js/ui/celebrate.js",
  "./js/ui/challengeBar.js",
  "./js/ui/challengesScreen.js",
  "./js/ui/dom.js",
  "./js/ui/miniMolecule.js",
  "./js/ui/moleculePanel.js",
  "./js/ui/nav.js",
  "./js/ui/pegs.js",
  "./js/ui/status.js",
  "./js/ui/tray.js",
  "./js/ui/updateBanner.js",
  "./js/ui/viewer3d.js",
];

// קבצים שלא משתנים בין גרסאות: מהמטמון קודם
const STATIC = [
  "./vendor/three.min.js",
  "./vendor/OrbitControls.js",
  "./fonts/secular-one-hebrew.woff2",
  "./fonts/secular-one-latin.woff2",
  "./fonts/varela-round-hebrew.woff2",
  "./fonts/varela-round-latin.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...CORE, ...STATIC])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

const isStatic = (url) => /\/(vendor|fonts|icons)\//.test(url.pathname);

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
    return response;
  } catch {
    const hit = await caches.match(request, { ignoreSearch: true });
    if (hit) return hit;
    if (request.mode === "navigate") return caches.match("./index.html");
    throw new Error("offline");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(isStatic(url) ? cacheFirst(request) : networkFirst(request));
});
