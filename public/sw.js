const CACHE_NAME = "vibraxx-shell-v3";

const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/images/logo.png",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png"
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

  if (req.method !== "GET") return;

  // API / Supabase → direkt network
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("supabase")
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // Sayfa geçişleri
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match("/offline.html") || caches.match("/");
      })
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
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
