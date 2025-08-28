import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AnnouncementsPage() {
  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="neon-text shimmer text-4xl md:text-5xl font-extrabold tracking-tight">Announcements</h1>
          <p className="mt-3 text-white/70">Product updates, feature releases, and important notices.</p>
        </header>

        <div className="mt-10 grid gap-4">
          {[
            { date:"8/20/2025", title:"Launch: VibraXX Studio", body:"Text-to-video demo is live. Generate, preview, download & share."},
            { date:"8/18/2025", title:"Pricing Update", body:"Trial, Starter, Creator and Pro packs are now available globally."},
            { date:"8/15/2025", title:"Watermark Toggle", body:"You can choose watermark or no-watermark packs per need."},
          ].map((a)=>(
            <article key={a.title} className="card">
              <div className="text-xs text-white/50">{a.date}</div>
              <h3 className="mt-1 text-lg font-semibold">{a.title}</h3>
              <p className="mt-1 text-white/70">{a.body}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
