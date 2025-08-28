"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const faqs = [
  { q: "Is payment secure?", a: "Yes. Payments are processed by Paddle with PCI-DSS compliance and SCA support." },
  { q: "Do credits expire?", a: "No. Pack credits do not expire, but refunds follow our ToS." },
  { q: "Which languages can I write prompts in?", a: "You can write in most languages. English tends to produce the most consistent results." },
  { q: "What about resolution and duration?", a: "Current packs target 1080p and ~10s. Longer options will arrive after vendor confirmation." },
  { q: "Is there a watermark?", a: "Starter includes watermark; Creator/Pro are no-watermark." },
  { q: "How fast are the videos delivered?", a: "Usually seconds to a couple of minutes, depending on queue and prompt complexity." },
];

function Item({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-${i}`}
      >
        <span className="font-medium">{q}</span>
        <span className="text-white/60">{open ? "▾" : "▸"}</span>
      </button>
      <div id={`faq-${i}`} className={`px-4 pb-4 text-white/70 text-sm ${open ? "block" : "hidden"}`}>
        {a}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div>
      <Navbar />

      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
              Frequently Asked Questions
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Short, clear answers to common questions.
          </p>
        </div>

        <div className="mt-10 grid gap-4 max-w-3xl mx-auto">
          {faqs.map((f, i) => <Item key={f.q} q={f.q} a={f.a} i={i} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
}
