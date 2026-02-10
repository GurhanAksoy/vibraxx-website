"use client";

import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    // ═══ SERVICE WORKER REGISTER ═══
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => console.log("[PWA] Service Worker registered"))
        .catch((err) =>
          console.error("[PWA] Service Worker registration failed:", err)
        );
    }

    // ═══ PWA INSTALL PROMPT ═══
    let deferredPrompt: any = null;

    const beforeInstall = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
    };

    const onInstalled = () => {
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
