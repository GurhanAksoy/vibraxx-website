import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Studio — VibraXX" };

function NeonLetters({ text }: { text: string }) {
  return (
    <span aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className="neon-letter">{ch}</span>
      ))}
    </span>
  );
}

export default function StudioPage() {
  return (
    <>
      <Navbar />
      <main className="container section">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            <NeonLetters text="Studio" />
          </h1>
          <p className="mt-3 text-white/70">
            Enter your prompt, generate, preview, download or share.
          </p>
        </div>

        {/* Basit demo-yapı: solda prompt, sağda preview */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Prompt card */}
          <div className="card neon-border neon-border--soft" style={{ ["--neon" as any]:"var(--v2)" }}>
            <div className="text-sm font-semibold mb-3">Prompt</div>
            <label className="flex items-center gap-2 mb-3 text-sm text-white/80">
              <input type="checkbox" className="accent-cyan-400" defaultChecked /> Include watermark
            </label>
            <textarea
              rows={6}
              placeholder="Describe the scene you want (max ~300 chars)…"
              className="w-full rounded-xl bg-black/30 border border-white/10 p-3 outline-none focus:border-white/20"
            />
            <div className="mt-4 flex gap-3">
              <button className="nav-btn nav-btn--primary">Generate Video</button>
            </div>
          </div>

          {/* Preview card */}
          <div className="card neon-border neon-border--soft" style={{ ["--neon" as any]:"var(--v1)" }}>
            <div className="text-sm font-semibold mb-3">Preview</div>
            <div className="text-xs text-white/60 mb-3">1080p · 10s · watermark</div>
            <div className="h-48 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center text-white/40">
              Your video will appear here after generation.
            </div>
            <div className="mt-4 flex gap-3">
              <button className="btn-outline">Download</button>
              <button className="btn-outline">Share</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
