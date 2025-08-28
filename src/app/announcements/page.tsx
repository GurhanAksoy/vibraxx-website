export const metadata = { title: "Announcements — VibraXX" };

const items = [
  {
    date: "8/20/2025",
    title: "Launch: VibraXX Studio",
    desc: "Text-to-video demo is live. Generate, preview, download & share.",
    neon: "var(--v1)",
  },
  {
    date: "8/18/2025",
    title: "Pricing Update",
    desc: "Trial, Starter, Creator and Pro packs are now available globally.",
    neon: "var(--v2)",
  },
  {
    date: "8/15/2025",
    title: "Watermark Toggle",
    desc: "You can choose watermark or no-watermark packs per need.",
    neon: "var(--v3)",
  },
];

export default function AnnouncementsPage() {
  return (
    <main className="container section">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="neon-title text-5xl md:text-6xl font-extrabold tracking-tight">
          Announcements
        </h1>
        <p className="mt-3 text-white/70">Product updates, feature releases, and important notices.</p>
      </div>

      <div className="mt-10 space-y-4">
        {items.map((it) => (
          <article
            key={it.title}
            className="rounded-2xl p-5 border border-white/10 bg-white/5 neon-border neon-border--soft"
            style={{ ["--neon" as any]: it.neon }}
          >
            <div className="text-xs text-white/50">{it.date}</div>
            <h3 className="mt-1 text-lg font-semibold">{it.title}</h3>
            <p className="mt-1 text-sm text-white/70">{it.desc}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
