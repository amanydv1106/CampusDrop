const CACHE_NAME = "campus-drop-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle Web Share Target POST requests
  if (event.request.method === "POST" && url.searchParams.has("shared")) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const files = formData.getAll("files");

        // Cache shared files in cache storage or IndexedDB for app retrieval
        const client = await self.clients.get(event.resultingClientId || event.clientId);
        if (client) {
          client.postMessage({ type: "SHARE_TARGET_FILES", files });
        }

        return Response.redirect("/", 303);
      })()
    );
    return;
  }

  // Handle standard static GET requests
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
    );
  }
});
