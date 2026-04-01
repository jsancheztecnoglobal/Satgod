self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("tecnoglobal-shell-v1").then((cache) =>
      cache.addAll(["/dashboard", "/clientes", "/activos", "/tecnico"]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          void caches.open("tecnoglobal-runtime-v1").then((cache) => {
            void cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => caches.match("/dashboard"));
    }),
  );
});
