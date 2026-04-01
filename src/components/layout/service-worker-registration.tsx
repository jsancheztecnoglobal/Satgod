"use client";

import { useEffect } from "react";
import { Workbox } from "workbox-window";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const wb = new Workbox("/sw.js");

    void wb.register();
  }, []);

  return null;
}
