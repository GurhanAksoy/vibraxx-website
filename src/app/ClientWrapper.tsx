"use client";

import { useEffect, useState } from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        html, body {
          background-color: #020817 !important;
          color: white;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        .preload-screen {
          position: fixed;
          inset: 0;
          background: #020817;
          z-index: 9999;
          opacity: 1;
          transition: opacity 0.6s ease;
        }
        .preload-screen.hide {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>

      <div className={`preload-screen ${isReady ? "hide" : ""}`} />
      {children}
    </>
  );
}
