import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const items = [
  { date: "2025-08-20", title: "Launch: VibraXX Studio", body: "Text-to-video demo is live. Generate, preview, download & share." },
  { date: "2025-08-18", title: "Pricing Update", body: "Trial, Starter, Creator and Pro packs are now available globally." },
  { date: "2025-08-15", title: "Watermark Toggle", body: "You can choose watermark or no-watermark packs per need." },
];

export default function Announcements() {
  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center">Announcements</h1>
          <p className="text-white/70 text-center mt-2">Product updates, feature releases and important notices.</p>

          <div className="mt-8 space-y-4">
            {items.map((it) => (
              <div key={it.title} className="card">
                <div className="text-white/60 text-xs">{new Date(it.date).toLocaleDateString()}</div>
                <h3 className="text-lg font-semibold mt-1">{it.title}</h3>
                <p className="text-white/70 mt-2 text-sm leading-relaxed">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
