"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const items = [
  {
    date: "8/20/2025",
    title: "Launch: VibraXX Studio",
    desc: "Text-to-video demo is live. Generate, preview, download & share.",
  },
  {
    date: "8/18/2025",
    title: "Pricing Update",
    desc: "Trial, Starter, Creator and Pro packs are now available globally.",
  },
  {
    date: "8/15/2025",
    title: "Watermark Toggle",
    desc: "You can choose watermark or no-watermark packs per need.",
  },
];

export default function AnnouncementsPage() {
  return (
    <div>
      <Navbar />

      <main className="section container">
        {/* Başlık — Hero/Studio ile AYNI */}
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="inline-block">
              <span className="neon-letter" style={{ ["--c" as any]: "#00E5FF" }}>A</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#7C5CFF" }}>n</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF2BD6" }}>n</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#00FFA3" }}>o</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FFD166" }}>u</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF7EB3" }}>n</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#00E5FF" }}>c</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#7C5CFF" }}>e</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF2BD6" }}>m</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#00FFA3" }}>e</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FFD166" }}>n</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#FF7EB3" }}>t</span>
              <span className="neon-letter" style={{ ["--c" as any]: "#00E5FF" }}>s</span>
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Product updates, feature releases and important notices.
          </p>
        </div>

        {/* Liste */}
        <div className="mt-10 space-y-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:border-white/20 transition"
            >
              <div className="text-xs text-white/50">{it.date}</div>
              <div className="mt-2 text-lg font-semibold">{it.title}</div>
              <div className="mt-1 text-white/70 text-sm">{it.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
