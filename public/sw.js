const CACHE_NAME = "vibraxx-v2"; // ⚡ her deploy'da artır: v2, v3...
const RUNTIME_CACHE = "vibraxx-runtime-v2";
const RUNTIME_MAX_ENTRIES = 60;
const RUNTIME_MAX_AGE_MS  = 7 * 24 * 60 * 60 * 1000; // 7 gün

// Runtime cache temizleme — boyut ve yaş kontrolü
async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys  = await cache.keys();
  if (keys.length <= RUNTIME_MAX_ENTRIES) return;
  const toDelete = keys.slice(0, keys.length - RUNTIME_MAX_ENTRIES);
  await Promise.all(toDelete.map(k => cache.delete(k)));
}

// App Shell - Critical assets
const APP_SHELL = [
  "/",
  "/offline.html",
  "/images/logo.png",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png",
  "/icons/apple-icon-180.png",
  "/sounds/vibraxx.mp3", // ✅ müzik offline'da da çalışsın
];

// ═══════════════════════════════════════════════════════════
// INSTALL - Cache app shell
// ═══════════════════════════════════════════════════════════
self.addEventListener("install", (event) => {
  console.log("[SW] Install - Caching app shell");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.error("[SW] Cache addAll failed:", err);
      });
    })
  );

  // Skip waiting for faster activation
  self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════
// ACTIVATE - Clean old caches
// ═══════════════════════════════════════════════════════════
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate - Cleaning old caches");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // ✅ claim() inside waitUntil
  );
});

// ═══════════════════════════════════════════════════════════
// MESSAGE - Handle skip waiting
// ═══════════════════════════════════════════════════════════
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting triggered by client");
    self.skipWaiting();
  }
});

// ═══════════════════════════════════════════════════════════
// FETCH - Network strategies
// ═══════════════════════════════════════════════════════════
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // ❗ NEVER cache Next.js build chunks (prevents hydration crashes)
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // ❗ NEVER cache manifest — always fresh
  if (url.pathname === "/manifest.json") {
    return;
  }

  // Skip cross-origin requests except for allowed CDNs
  if (url.origin !== location.origin) {
    if (
      !url.hostname.includes("supabase") &&
      !url.hostname.includes("googleapis") &&
      !url.hostname.includes("gstatic") &&
      !url.hostname.includes("flagcdn.com") // ✅ bayrak resimleri cache'lensin
    ) {
      return;
    }
  }

  // ═══ STRATEGY 1: API / Supabase - Network only ═══
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) {
    event.respondWith(fetch(request));
    return;
  }

  // ═══ STRATEGY 2: Navigation — Cache first, network update in BG, offline fallback ═══
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((c) => c.put(request, response.clone()));
            }
            return response;
          })
          .catch(() => cached || caches.match("/offline.html").then(r => r || new Response("Offline", { status: 503 })));

        // Cached varsa hemen dön + arka planda güncelle, yoksa network bekle
        return cached || networkFetch;
      })
    );
    return;
  }

  // ═══ STRATEGY 3: Static assets - Cache first, network fallback ═══
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, update in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, networkResponse.clone());
                trimRuntimeCache();
              });
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
            trimRuntimeCache();
          });

          return networkResponse;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches.match("/offline.html");
          }
          return new Response("Network error", { status: 503 });
        });
    })
  );
});
