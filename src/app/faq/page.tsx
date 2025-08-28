import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  { q: "Is payment secure?", a: "Yes. Payments are processed by Paddle with PCI-DSS compliance." },
  { q: "Do credits expire?", a: "Credits don’t expire for 12 months from purchase." },
  { q: "Which languages can I write prompts in?", a: "English performs best today; other languages work for most prompts." },
  { q: "What about resolution and duration?", a: "Currently 1080p, ~10 seconds. Longer clips will roll out gradually." },
  { q: "Is there a watermark?", a: "You can choose watermark or no-watermark packs." },
  { q: "How fast are the videos delivered?", a: "Most videos are ready in seconds, depending on queue." },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="neon-text shimmer text-4xl md:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-3 text-white/70">Short, clear answers to common questions.</p>
        </header>

        <div className="mt-10 grid gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="card">
              <summary className="cursor-pointer text-base font-semibold">{f.q}</summary>
              <p className="mt-2 text-white/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
