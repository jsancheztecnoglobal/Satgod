self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

      const registration = await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      clients.forEach((client) => {
        client.navigate(client.url);
      });

      return registration;
    })(),
  );
});
