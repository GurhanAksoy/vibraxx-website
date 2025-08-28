"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [withWatermark, setWithWatermark] = useState(true);

  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
              Studio
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Enter your prompt, generate, preview, download or share.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Prompt */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <input
                id="wm"
                type="checkbox"
                checked={withWatermark}
                onChange={(e) => setWithWatermark(e.target.checked)}
                className="accent-sky-400"
              />
              <label htmlFor="wm" className="text-sm text-white/80 select-none">
                Include watermark
              </label>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 rounded-xl bg-black/30 border border-white/10 outline-none p-4 text-sm"
              placeholder="Describe the scene you want (max ~300 chars)…"
              maxLength={300}
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-full px-5 py-3 text-sm font-semibold bg-gradient-to-r from-sky-400 to-fuchsia-500 text-black shadow-[0_0_12px_rgba(124,92,255,0.35)] hover:scale-[1.02] active:scale-95 transition"
              >
                Generate Video
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60 mb-3">
              1080p · 10s · {withWatermark ? "watermark" : "no watermark"}
            </div>
            <div className="aspect-video w-full rounded-xl border border-white/10 bg-black/30 grid place-items-center text-white/50">
              Your video will appear here after generation.
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-full px-5 py-3 text-sm font-semibold border border-white/15 text-white hover:bg-white/5 transition"
              >
                Download
              </button>
              <button
                type="button"
                className="rounded-full px-5 py-3 text-sm font-semibold border border-white/15 text-white hover:bg-white/5 transition"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
