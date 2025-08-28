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

const items = [
  { date: "2025-08-20", title: "Launch: VibraXX Studio", desc: "Text-to-video demo is live. Generate, preview, download & share." },
  { date: "2025-08-18", title: "Pricing Update",         desc: "Trial, Starter, Creator and Pro packs are now available globally." },
  { date: "2025-08-15", title: "Watermark Toggle",       desc: "You can choose watermark or no-watermark packs per need." },
];

export default function AnnouncementsPage() {
  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <NeonWord text="Announcements" />
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70">
            Product updates, feature releases and important notices.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl p-5 border border-white/10 bg-white/5">
              <div className="text-xs text-white/50">{new Date(it.date).toLocaleDateString()}</div>
              <div className="mt-1 text-lg font-semibold">{it.title}</div>
              <div className="mt-1 text-sm text-white/70">{it.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
