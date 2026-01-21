self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("vibraxx-cache-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/manifest.json",
        "/icons/manifest-icon-192.maskable.png",
        "/icons/manifest-icon-512.maskable.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
