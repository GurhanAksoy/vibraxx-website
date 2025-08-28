"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Studio() {
  const [prompt, setPrompt] = useState("");
  const [watermark, setWatermark] = useState(true);
  const [status, setStatus] = useState<"idle"|"queue"|"rendering"|"ready"|"error">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return alert("Please enter a short prompt.");
    setStatus("queue");
    setVideoUrl(null);
    // DEMO: queue → rendering → ready
    setTimeout(() => setStatus("rendering"), 800);
    setTimeout(() => {
      setStatus("ready");
      setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    }, 3400);
  }

  function handleDownload(){
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "vibraxx-video.mp4";
    a.click();
  }

  function handleShare(){
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    alert("Share link copied to clipboard!");
  }

  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-5xl">
          {/* Canlı neon degrade başlık */}
          <h1 className="neon-title text-center">Studio</h1>
          <p className="text-white/70 text-center mt-2">
            Enter your prompt, generate, preview, download or share.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* LEFT: Controls */}
            <div className="card">
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e)=>setPrompt(e.target.value)}
                placeholder="Describe the scene you want (max ~300 chars)…"
                className="w-full h-40 rounded-xl bg-white/5 border border-white/10 p-4 outline-none focus:border-white/30"
                maxLength={300}
              />
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={watermark}
                    onChange={(e)=>setWatermark(e.target.checked)}
                  />
                  Include watermark
                </label>
                <button onClick={handleGenerate} className="nav-btn nav-btn--primary">
                  Generate Video
                </button>
              </div>

              <div className="mt-4 text-sm text-white/70">
                {status === "idle" && <span>Ready.</span>}
                {status === "queue" && <span>Queued…</span>}
                {status === "rendering" && <span>Rendering…</span>}
                {status === "ready" && <span>Done.</span>}
                {status === "error" && <span>Something went wrong.</span>}
              </div>
            </div>

            {/* RIGHT: Preview */}
            <div className="card flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">Preview</h3>
                <p className="text-white/70 text-sm mt-1">
                  <span className="nowrap">1080p</span> · <span className="nowrap">10s</span> ·{" "}
                  <span className="nowrap">{watermark ? "watermark" : "no watermark"}</span>
                </p>
              </div>

              <div className="mt-4 aspect-video w-full rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                {videoUrl ? (
                  <video src={videoUrl} controls className="w-full h-full" />
                ) : (
                  <span className="text-white/50 text-sm">Your video will appear here after generation.</span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={handleDownload} className="nav-btn" disabled={!videoUrl}>Download</button>
                <button onClick={handleShare} className="nav-btn" disabled={!videoUrl}>Share</button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-white/60">
            Credits: <span className="nowrap">14 / 20</span> (demo)
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
