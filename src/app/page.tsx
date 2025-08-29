"use client";
import Link from "next/link";

type Plan = {
  key: string;
  name: string;
  price: number;
  videos: number;
  watermark: boolean;
  priceId: string;
};

const plans: Plan[] = [
  { key: "single", name: "Single", price: 3.99, videos: 1, watermark: false, priceId: "price_single_xxx" },
  { key: "bundle12", name: "Bundle (12)", price: 39.99, videos: 12, watermark: false, priceId: "price_bundle12_xxx" },
];

function openCheckoutMock() {
  alert("Checkout will be available after we connect payments.");
}

export default function HomePage() {
  return (
    <div className="gradient">
      {/* HERO */}
      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance font-extrabold tracking-tight leading-tight md:leading-[1.1] text-5xl md:text-6xl">
            <span className="neon-word-1">Create</span>{" "}
            <span className="neon-word-2">Stunning</span>{" "}
            <span className="neon-word-3">Videos</span>{" "}
            <span className="neon-word-4">in</span>{" "}
            <span className="neon-word-5">Seconds</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Turn text into high-quality <span className="nowrap">1080p</span> clips. Clear pricing, instant delivery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/studio" className="nav-btn nav-btn--primary w-full sm:w-auto">Launch Studio</Link>
            <a href="#pricing" className="nav-btn w-full sm:w-auto">View Pricing</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="neon-title text-3xl md:text-4xl">Why VibraXX</h2>
          <p className="text-white/70 mt-2">Professional quality, honest pricing, built to scale globally.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Seamless Flow",   desc: "Prompt → generate → download/share. That simple." },
            { title: "Transparent",     desc: "No credits confusion. You know how many videos you get." },
            { title: "Fast Delivery",   desc: "Ready in seconds, optimized for socials." },
            { title: "Flexible Output", desc: "Default 1080p, watermark-free." },
            { title: "Policy-Ready",    desc: "Clear ToS, Privacy and DMCA compliance." },
            { title: "Global-Ready",    desc: "Modern CDN + edge infra for worldwide reach." },
          ].map((f) => (
            <div key={f.title} className="card neon-border">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-white/70 mt-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING (ONLY 2 PLANS) */}
      <section id="pricing" className="section container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="neon-title text-3xl md:text-4xl">Pricing</h2>
          <p className="text-white/70 mt-2">Simple packages. No surprises.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {plans.map((p) => (
            <div key={p.key} className="card flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl md:text-4xl font-extrabold nowrap">${p.price.toFixed(2)}</p>
                <p className="mt-1 text-sm text-white/70">
                  {p.videos} {p.videos === 1 ? "video" : "videos"} · <span className="nowrap">1080p</span> · <span className="nowrap">~10&nbsp;s</span> · <span className="nowrap">no watermark</span>
                </p>
              </div>
              <button onClick={openCheckoutMock} type="button" className="mt-6 nav-btn nav-btn--primary">
                Buy Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-white/50">
          Need higher volumes? <Link href="/announcements" className="underline">Contact us for custom pricing.</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="section container">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h3 className="text-2xl font-bold">Ready to create?</h3>
          <p className="text-white/70 mt-1">Generate your first video now.</p>
          <div className="mt-4">
            <Link href="/studio" className="nav-btn nav-btn--primary">Launch Studio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
