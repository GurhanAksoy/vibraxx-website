import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const posts = [
  {
    date: "8/20/2025",
    title: "Launch: VibraXX Studio",
    body: "Text-to-video demo is live. Generate, preview, download & share.",
  },
  {
    date: "8/18/2025",
    title: "Pricing Update",
    body: "Trial, Starter, Creator and Pro packs are now available globally.",
  },
  {
    date: "8/15/2025",
    title: "Watermark Toggle",
    body: "You can choose watermark or no-watermark packs per need.",
  },
];

export default function AnnouncementsPage() {
  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="neon-title leading-tight" style={{fontSize:"clamp(2rem, 5vw, 3rem)"}}>
            Announcements
          </h1>
          <p className="mt-3 text-white/70">Product updates, feature releases, and important notices.</p>
        </header>

        <div className="mt-10 space-y-4">
          {posts.map((p) => (
            <article key={p.title} className="card">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{p.date}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="font-semibold text-white/80">{p.title}</span>
              </div>
              <p className="mt-2 text-white/80">{p.body}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
