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

      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
              Announcements
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Product updates, feature releases and important notices.
          </p>
        </div>

        <div className="mt-10 grid gap-4 max-w-3xl mx-auto">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl p-5 border border-white/10 bg-white/5">
              <div className="text-xs text-white/50 mb-1">{it.date}</div>
              <div className="text-lg font-semibold">{it.title}</div>
              <div className="text-sm text-white/70 mt-1">{it.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
