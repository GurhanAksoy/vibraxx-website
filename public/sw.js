const CACHE_NAME = "vibraxx-shell-v3";

// Sadece gerçekten offline çalışabilecek şeyler
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png",
  "/images/logo.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Installing & caching shell");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Sadece GET
  if (req.method !== "GET") return;

  // Supabase / API → ASLA cache'leme
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // NAVIGATION (sayfa değişimi)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // STATIC ASSETS → cache first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // sadece başarılı response cache'le
          if (!res || res.status !== 200) return res;

          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });

          return res;
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});
