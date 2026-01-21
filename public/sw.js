const CACHE_NAME = "vibraxx-shell-v3";

const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/images/logo.png",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png"
];

// ================= INSTALL =================
self.addEventListener("install", (event) => {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // ❌ skipWaiting YOK → update flow için şart
});

// ================= ACTIVATE =================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");
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

// ================= UPDATE FLOW =================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting triggered");
    self.skipWaiting();
  }
});

// ================= FETCH =================
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Sadece GET
  if (req.method !== "GET") return;

  // API / Supabase → asla cache
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("supabase")
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // NAVIGATION (sayfa değişimi)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match("/offline.html");
      })
    );
    return;
  }

  // STATIC ASSETS → cache first
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
