// src/components/PreloadOverlay.tsx
"use client";

import { useEffect, useState } from "react";

export default function PreloadOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020817",
        zIndex: 9999,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    />
  );
}
