"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [withWatermark, setWithWatermark] = useState(true);

  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="neon-title leading-tight" style={{fontSize:"clamp(2rem, 5vw, 3rem)"}}>
            Studio
          </h1>
          <p className="mt-3 text-white/70">
            Enter your prompt, generate, preview, download or share.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Left: prompt */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Prompt</h3>
              <label className="flex items-center gap-2 text-white/80 text-sm">
                <input
                  type="checkbox"
                  checked={withWatermark}
                  onChange={(e) => setWithWatermark(e.target.checked)}
                />
                Include watermark
              </label>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scene you want (max ~300 chars)…"
              className="mt-4 w-full h-40 bg-black/30 border border-white/10 rounded-xl p-3 outline-none"
            />

            <button className="mt-4 nav-btn nav-btn--primary" type="button">
              Generate Video
            </button>
          </div>

          {/* Right: preview */}
          <div className="card flex flex-col">
            <h3 className="font-semibold">Preview</h3>
            <p className="mt-1 text-sm text-white/60">
              1080p · 10s · {withWatermark ? "watermark" : "no watermark"}
            </p>

            <div className="mt-4 aspect-video w-full bg-black/30 border border-white/10 rounded-xl grid place-items-center">
              <p className="text-white/50">Your video will appear here after generation.</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="nav-btn" type="button">Download</button>
              <button className="nav-btn" type="button">Share</button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
