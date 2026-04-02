"use client";

import { useEffect } from "react";

export function RuntimeCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const unregisterLegacyRuntime = async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
    };

    void unregisterLegacyRuntime();
  }, []);

  return null;
}
