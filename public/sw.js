const CACHE_NAME = "vibraxx-v3"; // ⚡ her deploy'da artır: v2, v3...
const RUNTIME_CACHE = "vibraxx-runtime-v3";
const RUNTIME_MAX_ENTRIES = 60;
const RUNTIME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

// Runtime cache temizleme — yaş + boyut kontrolü
async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();

  if (!requests.length) return;

  const now = Date.now();
  const entries = [];

  for (const request of requests) {
    const response = await cache.match(request);
    if (!response) continue;

    const cachedAt = response.headers.get("sw-cached-at");
    const cachedTime = cachedAt ? Number(cachedAt) : now;

    entries.push({
      request,
      cachedTime,
    });
  }

  // Önce süresi geçenleri sil
  const expired = entries.filter((entry) => now - entry.cachedTime > RUNTIME_MAX_AGE_MS);
  await Promise.all(expired.map((entry) => cache.delete(entry.request)));

  // Tekrar listele
  const freshRequests = await cache.keys();
  if (freshRequests.length <= RUNTIME_MAX_ENTRIES) return;

  const freshEntries = [];
  for (const request of freshRequests) {
    const response = await cache.match(request);
    if (!response) continue;

    const cachedAt = response.headers.get("sw-cached-at");
    const cachedTime = cachedAt ? Number(cachedAt) : 0;

    freshEntries.push({
      request,
      cachedTime,
    });
  }

  // Eski olanlar önce silinsin
  freshEntries.sort((a, b) => a.cachedTime - b.cachedTime);

  const toDelete = freshEntries.slice(0, freshEntries.length - RUNTIME_MAX_ENTRIES);
  await Promise.all(toDelete.map((entry) => cache.delete(entry.request)));
}

// Response'u cache için güvenli hale getir
async function toCacheableResponse(response) {
  // Opaque response ise body'e dokunmadan clone kullan
  if (response.type === "opaque") {
    return response.clone();
  }

  const body = await response.blob();
  const headers = new Headers(response.headers);
  headers.set("sw-cached-at", Date.now().toString());

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Güvenli cache put helper
async function putInCache(cacheName, request, response) {
  // Range request'leri cache'leme
  if (request.headers.has("range")) {
    return;
  }

  // Partial content (206) Cache API'da desteklenmez
  if (response.status === 206) {
    return;
  }

  // Başarısız response'ları cache'leme
  if (!response || (!response.ok && response.type !== "opaque")) {
    return;
  }

  const cache = await caches.open(cacheName);
  const cacheableResponse = await toCacheableResponse(response);
  await cache.put(request, cacheableResponse);
}

// App Shell - Critical assets
const APP_SHELL = [
  "/",
  "/offline.html",
  "/images/logo.png",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png",
  "/icons/apple-icon-180.png",
  "/sounds/vibraxx.mp3",
];

// ═══════════════════════════════════════════════════════════
// INSTALL - Cache app shell
// ═══════════════════════════════════════════════════════════
self.addEventListener("install", (event) => {
  console.log("[SW] Install - Caching app shell");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_SHELL);
      } catch (err) {
        console.error("[SW] Cache addAll failed:", err);
      }
    })()
  );

  self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════
// ACTIVATE - Clean old caches
// ═══════════════════════════════════════════════════════════
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate - Cleaning old caches");

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );

      await self.clients.claim();
    })()
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

  // Sadece GET
  if (request.method !== "GET") return;

  // Range request'lerine SW karışmasın
  if (request.headers.has("range")) return;

  // Next.js build chunk'larını asla cache'leme
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Manifest her zaman fresh
  if (url.pathname === "/manifest.json") {
    return;
  }

  // Sadece izinli cross-origin hostlar
  if (url.origin !== location.origin) {
    if (
      !url.hostname.includes("supabase") &&
      !url.hostname.includes("googleapis") &&
      !url.hostname.includes("gstatic") &&
      !url.hostname.includes("flagcdn.com")
    ) {
      return;
    }
  }

  // ═══ STRATEGY 1: API / Supabase - Network only ═══
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) {
    event.respondWith(fetch(request));
    return;
  }

  // ═══ STRATEGY 2: Navigation — Cache first, network update in background, offline fallback ═══
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);

        const networkFetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseForReturn = networkResponse;
              const responseForCache = networkResponse.clone();

              event.waitUntil(
                (async () => {
                  try {
                    await putInCache(CACHE_NAME, request, responseForCache);
                  } catch (err) {
                    console.error("[SW] Navigation cache put failed:", err);
                  }
                })()
              );

              return responseForReturn;
            }

            return networkResponse;
          })
          .catch(async () => {
            if (cached) return cached;

            const offline = await caches.match("/offline.html");
            return offline || new Response("Offline", { status: 503 });
          });

        if (cached) {
          event.waitUntil(networkFetchPromise.catch(() => {}));
          return cached;
        }

        return networkFetchPromise;
      })()
    );
    return;
  }

  // ═══ STRATEGY 3: Static assets - Cache first, network fallback ═══
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        const backgroundUpdate = fetch(request)
          .then(async (networkResponse) => {
            if (!networkResponse || !networkResponse.ok) return;

            const responseForCache = networkResponse.clone();

            try {
              await putInCache(RUNTIME_CACHE, request, responseForCache);
              await trimRuntimeCache();
            } catch (err) {
              console.error("[SW] Runtime background cache update failed:", err);
            }
          })
          .catch(() => {});

        event.waitUntil(backgroundUpdate);
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);

        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }

        const responseForReturn = networkResponse;
        const responseForCache = networkResponse.clone();

        event.waitUntil(
          (async () => {
            try {
              await putInCache(RUNTIME_CACHE, request, responseForCache);
              await trimRuntimeCache();
            } catch (err) {
              console.error("[SW] Runtime cache put failed:", err);
            }
          })()
        );

        return responseForReturn;
      } catch (error) {
        if (request.destination === "document") {
          const offline = await caches.match("/offline.html");
          return offline || new Response("Offline", { status: 503 });
        }

        return new Response("Network error", { status: 503 });
      }
    })()
  );
});