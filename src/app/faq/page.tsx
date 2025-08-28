import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How fast are the videos delivered?",
    a: "Most clips render in seconds. Longer prompts may take slightly more.",
  },
  {
    q: "Is there a watermark?",
    a: "You can choose packs with watermark or no-watermark.",
  },
  {
    q: "What about resolution and duration?",
    a: "Default demo is 1080p / ~10s. We’ll publish extended options after our Luma integration.",
  },
  {
    q: "Which languages can I write prompts in?",
    a: "English works best today. Multilingual prompt support is on our roadmap.",
  },
  {
    q: "Do credits expire?",
    a: "Purchased packs don’t expire during the public beta.",
  },
  {
    q: "Is payment secure?",
    a: "We use a PCI-compliant provider for all transactions.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <section className="section container">
        <header className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="neon-title leading-tight" style={{fontSize:"clamp(2rem, 5vw, 3rem)"}}>
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-white/70">Short, clear answers to common questions.</p>
        </header>

        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card">
              <summary className="cursor-pointer text-lg font-semibold">{f.q}</summary>
              <p className="mt-2 text-white/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
