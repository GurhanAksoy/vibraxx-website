"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function NeonWord({ text }: { text: string }) {
  const palette = ["#00E5FF", "#7C5CFF", "#FF2BD6", "#00FFA3", "#FFD166", "#FF7EB3"];
  return (
    <span className="inline-block">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="neon-letter" style={{ ["--c" as any]: palette[i % palette.length] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      // TODO: Buraya Luma/Runway entegrasyonu gelecek
      await new Promise((r) => setTimeout(r, 1200));
      setVideoUrl("https://samplelib.com/lib/preview/mp4/sample-5s.mp4"); // demo
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "vibraxx-preview.mp4";
    a.click();
  }

  function handleShare() {
    if (!videoUrl) return;
    navigator.clipboard?.writeText(videoUrl);
    alert("Link copied to clipboard.");
  }

  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <NeonWord text="Studio" />
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70">
            Enter your prompt, generate, preview, download or share.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Prompt */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prompt</h3>
              <label className="flex items-center gap-2 text-sm text-white/70 select-none">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="h-4 w-4 accent-[#7C5CFF]"
                />
                Include watermark
              </label>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scene you want (max ~300 chars)…"
              maxLength={300}
              className="mt-4 w-full h-44 rounded-xl bg-black/30 border border-white/10 p-4 outline-none focus:border-white/20"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className={`nav-btn nav-btn--primary ${(!prompt || isGenerating) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isGenerating ? "Generating…" : "Generate Video"}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Preview</h3>
            <p className="text-sm text-white/60 mt-1">
              <span className="nowrap">high-res</span> · <span className="nowrap">short format</span> ·{" "}
              <span className="nowrap">{includeWatermark ? "watermark" : "no watermark"}</span>
            </p>

            <div className="mt-4 aspect-video w-full rounded-xl bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
              {videoUrl ? (
                <video src={videoUrl} className="w-full h-full" controls />
              ) : (
                <p className="text-white/50">Your video will appear here after generation.</p>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!videoUrl}
                className={`nav-btn ${!videoUrl ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                Download
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={!videoUrl}
                className={`nav-btn ${!videoUrl ? "opacity-60 cursor-not-allowed" : ""}`}
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
