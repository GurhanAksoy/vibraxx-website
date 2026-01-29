import { useEffect } from "react";

/**
 * Registers the service worker once on first page load.
 * - SSR safe
 * - Memory leak safe
 * - No duplicate listeners
 */
export function useRegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("[SW] registered");
        })
        .catch((err) => {
          console.error("[SW] registration failed:", err);
        });
    };

    window.addEventListener("load", register);

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);
}
