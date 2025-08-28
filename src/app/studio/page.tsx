"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setStatus("generating");

    // DEMO akışı (API bağlayınca burayı değiştirirsin)
    await new Promise((r) => setTimeout(r, 1800));
    setVideoUrl("/demo-video.mp4"); // placeholder
    setStatus("ready");
  }

  return (
    <div>
      <Navbar />

      <main className="section container">
        {/* Başlık — Hero’daki Create ile AYNI stil */}
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="inline-block">
              <span className="neon-letter" style={{ ["--c" as any]: "#00E5FF" }}>S</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#7C5CFF" }}>t</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF2BD6" }}>u</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#00FFA3" }}>d</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FFD166" }}>i</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF7EB3" }}>o</span>
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Enter your prompt, generate, preview, download or share.
          </p>
        </div>

        {/* Çalışma alanı */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Sol panel: Prompt */}
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="text-lg font-semibold mb-4">Prompt</h3>

            <label className="flex items-center gap-2 mb-4 select-none">
              <input
                type="checkbox"
                className="accent-cyan-400"
                checked={includeWatermark}
                onChange={(e) => setIncludeWatermark(e.target.checked)}
              />
              <span className="text-sm text-white/80">Include watermark</span>
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              maxLength={300}
              placeholder="Describe the scene you want (max ~300 chars)…"
              className="w-full rounded-xl bg-black/30 border border-white/10 outline-none p-4 placeholder-white/40 focus:border-white/20"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={status === "generating" || !prompt.trim()}
                className="btn btn-primary disabled:opacity-60"
              >
                {status === "generating" ? "Generating…" : "Generate Video"}
              </button>
            </div>

            <p className="text-sm text-white/50 mt-4">
              {status === "generating" ? "Rendering with your settings…" : status === "ready" ? "Ready." : " "}
            </p>
          </div>

          {/* Sağ panel: Preview */}
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <p className="text-sm text-white/60 mb-4">
              1080p · 10s · {includeWatermark ? "watermark" : "no watermark"}
            </p>

            <div className="flex-1 rounded-xl bg-black/30 border border-white/10 grid place-items-center text-white/40">
              {videoUrl && status === "ready" ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full rounded-xl"
                />
              ) : (
                <span>Your video will appear here after generation.</span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="btn btn-ghost"
                disabled={!videoUrl}
                onClick={() => videoUrl && window.open(videoUrl, "_blank")}
              >
                Download
              </button>
              <button
                className="btn btn-ghost"
                disabled={!videoUrl}
                onClick={() =>
                  videoUrl &&
                  navigator.share?.({
                    title: "VibraXX Video",
                    url: videoUrl,
                  })
                }
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
