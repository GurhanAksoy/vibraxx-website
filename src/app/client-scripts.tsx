"use client";

import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    // 🔻 PRELOAD FADE-OUT (ARTIK REACT SAFE)
    const el = document.getElementById("vibraxx-preload-bg");
    if (el) {
      el.style.opacity = "0";
      const t = setTimeout(() => {
        el.remove();
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

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

    window.addEventListener("beforeinstallprompt", beforeInstall);

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
    };
  }, []);

  return null;
}
