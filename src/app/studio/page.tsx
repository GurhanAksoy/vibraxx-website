"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function StudioPage() {
  const [wm, setWm] = useState(true);

  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="neon-text shimmer text-4xl md:text-5xl font-extrabold tracking-tight">Studio</h1>
          <p className="mt-3 text-white/70">Enter your prompt, generate, preview, download or share.</p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Prompt */}
          <div className="card">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={wm} onChange={(e)=>setWm(e.target.checked)} />
              Include watermark
            </label>
            <textarea
              className="mt-3 w-full h-40 bg-transparent outline-none border border-white/10 rounded-xl p-3"
              placeholder="Describe the scene you want (max ~300 chars)…"
            />
            <button className="btn btn-gradient mt-4">Generate Video</button>
          </div>

          {/* Preview */}
          <div className="card flex flex-col">
            <div className="text-sm text-white/60">
              1080p · 10s · {wm ? "watermark" : "no watermark"}
            </div>
            <div className="mt-3 grow rounded-xl border border-white/10 grid place-items-center text-white/40">
              Your video will appear here after generation.
            </div>
            <div className="mt-4 flex gap-3">
              <button className="btn btn-outline">Download</button>
              <button className="btn btn-outline">Share</button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
