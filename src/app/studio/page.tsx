"use client";

import { useEffect, useRef, useState } from "react";

type Provider = "luma" | "runway" | "auto";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("auto"); // varsayılan auto
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // ---- Status Poller (sadece gerçek providerlarda) ----
  useEffect(() => {
    if (!taskId) return;
    if (provider === "auto") return; // generate dönüşünde gerçek provider'ı set ediyoruz
    if (provider === "luma" || provider === "runway") {
      startPolling(taskId, provider);
    }
    // cleanup
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, provider]);

  function clearTimer() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function startPolling(id: string, p: Provider) {
    async function check() {
      try {
        const q = new URLSearchParams({ id, provider: p });
        const r = await fetch(`/api/status?${q.toString()}`, { cache: "no-store" });
        const data = await r.json();
        const stat = (data.status || data.state || data.phase || "")
          .toString()
          .toUpperCase();

        setStatus(stat);

        if (stat.includes("SUCCEED") || stat.includes("COMPLETE")) {
          // URL çıkarma
          let url: string | undefined;

          if (Array.isArray(data.output) && data.output.length) {
            url =
              data.output[0]?.uri ||
              data.output[0]?.url ||
              data.output[0]?.asset_url;
          }
          if (!url && Array.isArray(data.assets) && data.assets.length) {
            url = data.assets[0]?.url || data.assets[0]?.uri;
          }
          if (!url && typeof data.result === "object") {
            url =
              data.result?.video_url ||
              data.result?.url ||
              data.result?.uri ||
              data.result?.asset_url;
          }

          if (url) {
            setVideoUrl(url);
            clearTimer();
          }
        } else if (stat.includes("FAIL")) {
          setErr("Generation failed.");
          clearTimer();
        }
      } catch (e: any) {
        setErr(e?.message || "Status check failed");
        clearTimer();
      }
    }

    clearTimer();
    check();
    pollTimer.current = setInterval(check, 2500);
  }

  async function onGenerate() {
    try {
      setErr(null);
      setVideoUrl(null);
      setTaskId(null);
      setStatus(null);
      setIsLoading(true);

      if (!prompt.trim()) {
        setErr("Please enter a prompt.");
        setIsLoading(false);
        return;
      }

      // İstek at
      const r = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, provider }), // seçilen provider ile
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Generate failed: ${r.status} ${t}`);
      }
      const data = await r.json(); // { id, provider, demoUrl? }

      // DEMO_MODE kısa devre: direkt player'a demo videosunu yükle
      if (data?.provider === "demo" && data?.demoUrl) {
        setProvider("auto"); // poll yok
        setTaskId(data.id);
        setStatus("DEMO_READY");
        setVideoUrl(data.demoUrl);
        return;
      }

      // Gerçek provider döndüyse polling'i ona göre başlat
      if (!data?.id) throw new Error("No task id returned");
      if (!data?.provider) throw new Error("No provider returned");

      setProvider(data.provider as Provider);
      setTaskId(data.id);
    } catch (e: any) {
      setErr(e?.message || "Generate failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container section">
      <div className="max-w-3xl mx-auto">
        {/* Başlık – sade ve keskin */}
        <h1 className="text-4xl md:text-5xl font-extrabold neon-title">
          Studio
        </h1>
        <p className="mt-3 text-white/70">
          Enter a prompt, choose provider (or Auto), then generate. Demo mode returns a sample instantly.
        </p>

        {/* Prompt */}
        <div className="mt-6">
          <label className="block text-sm mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="A dynamic neon intro with cyberpunk city, rain reflections, bold title 'Taviz Yok'"
            className="w-full rounded-xl bg-white/5 border border-white/10 p-4 outline-none focus:border-white/25"
          />
        </div>

        {/* Provider seçimi + Generate */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="rounded-lg bg-white/5 border border-white/10 p-2 outline-none focus:border-white/25"
            >
              <option value="auto">Auto</option>
              <option value="luma">Luma</option>
              <option value="runway">Runway</option>
            </select>
          </div>

          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="sm:ml-auto nav-btn nav-btn--primary"
          >
            {isLoading ? "Generating..." : "Generate Video"}
          </button>
        </div>

        {/* Durum / Hata */}
        <div className="mt-4">
          {status && (
            <div className="text-sm text-white/70">
              Status: <span className="text-white">{status}</span>
            </div>
          )}
          {err && <div className="text-sm text-red-400 mt-2">Error: {err}</div>}
        </div>

        {/* Video çıktı */}
        {videoUrl && (
          <div className="mt-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                className="w-full max-w-3xl mx-auto"
                style={{ display: "block" }}
              />
            </div>
            <div className="mt-3 text-sm text-white/70 flex gap-2">
              <a href={videoUrl} download className="nav-btn">Download</a>
              <a href={videoUrl} target="_blank" className="nav-btn">Open</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
