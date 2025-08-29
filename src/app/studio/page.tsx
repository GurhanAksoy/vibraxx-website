// src/app/studio/page.tsx
"use client";
import { useState } from "react";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"runway" | "luma" | "auto">("auto");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setStatus(null);
    try {
      const r = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, provider }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Failed");

      setTaskId(data.id);

      // basit poller
      let done = false;
      while (!done) {
        await new Promise((res) => setTimeout(res, 2500));
        const q = new URLSearchParams({ id: data.id, provider });
        const s = await fetch("/api/status?" + q.toString());
        const js = await s.json();
        setStatus(js);

        if (js?.status === "succeeded" || js?.status === "failed" || js?.status === "aborted") {
          done = true;
        }
      }
    } catch (e: any) {
      setStatus({ error: e?.message || "error" });
    } finally {
      setLoading(false);
    }
  }

  const videoUrl =
    status?.output?.[0]?.asset_url ||
    status?.result?.video?.url || // luma success şeması
    null;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-5xl font-extrabold text-center mb-8">Studio</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SOL: Prompt */}
        <div className="rounded-2xl bg-neutral-900 p-5 border border-neutral-800">
          <label className="block text-sm text-neutral-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene (max ~300 chars)…"
            maxLength={300}
            className="w-full h-40 rounded-xl bg-neutral-800/60 border border-neutral-700 px-3 py-2 outline-none"
          />
          <div className="flex items-center justify-between mt-4 gap-3">
            <div className="flex gap-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
              >
                <option value="auto">Auto</option>
                <option value="runway">Runway</option>
                <option value="luma">Luma</option>
              </select>
            </div>
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="rounded-xl px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-400 disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate Video"}
            </button>
          </div>

          {taskId && (
            <p className="text-xs text-neutral-400 mt-3">
              Task ID: <span className="font-mono">{taskId}</span>
            </p>
          )}
        </div>

        {/* SAĞ: Önizleme */}
        <div className="rounded-2xl bg-neutral-900 p-5 border border-neutral-800">
          <div className="text-sm text-neutral-300 mb-2">Preview</div>
          <div className="aspect-video w-full rounded-xl bg-neutral-800/60 border border-neutral-700 flex items-center justify-center overflow-hidden">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-neutral-500 text-sm">
                Your video will appear here after generation.
              </span>
            )}
          </div>

          {/* Basit status debug */}
          {status && (
            <pre className="mt-4 text-xs whitespace-pre-wrap break-words bg-black/30 p-3 rounded-lg border border-neutral-800">
{JSON.stringify(status, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}