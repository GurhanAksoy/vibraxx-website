const CACHE_NAME = "vibraxx-v1";
const RUNTIME_CACHE = "vibraxx-runtime";

// App Shell - Critical assets
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/images/logo.png",
  "/icons/manifest-icon-192.maskable.png",
  "/icons/manifest-icon-512.maskable.png",
  "/icons/apple-icon-180.png",
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
    })
  );
  
  // Take control immediately
  return self.clients.claim();
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
  
  // Skip cross-origin requests except for same-origin API
  if (url.origin !== location.origin) {
    // Allow Supabase, Google Fonts, CDN
    if (!url.hostname.includes("supabase") && 
        !url.hostname.includes("googleapis") &&
        !url.hostname.includes("gstatic")) {
      return;
    }
  }
  
  // ═══ STRATEGY 1: API / Supabase - Network only ═══
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) {
    event.respondWith(fetch(request));
    return;
  }
  
  // ═══ STRATEGY 2: Navigation - Network first, fallback to offline ═══
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match("/offline.html").then((response) => {
            return response || new Response("Offline", { status: 503 });
          });
        })
    );
    return;
  }
  
  // ═══ STRATEGY 3: Static assets - Cache first, network fallback ═══
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, update in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {
          // Fetch failed, cached version already returned
        });
        
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Clone and cache for next time
        const responseClone = networkResponse.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return networkResponse;
      }).catch(() => {
        // Network failed, return offline page for navigations
        if (request.destination === "document") {
          return caches.match("/offline.html");
        }
        return new Response("Network error", { status: 503 });
      });
    })
  );
});
