"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  { key: "trial",   name: "Trial Pack",   price: 2.99, videos: 1,  watermark: true,  priceId: "price_trial_xxx" },
  { key: "starter", name: "Starter Pack", price: 9.99, videos: 5,  watermark: true,  priceId: "price_starter_xxx" },
  { key: "creator", name: "Creator Pack", price: 19.99, videos: 15, watermark: false, priceId: "price_creator_xxx" },
  { key: "pro",     name: "Pro Pack",     price: 49.99, videos: 50, watermark: false, priceId: "price_pro_xxx" },
];

// (Demo) Paddle checkout açma
let paddleInited = false;
function openCheckout(priceId: string) {
  // @ts-ignore
  if (typeof window !== "undefined" && window.Paddle && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
    // @ts-ignore
    if (!paddleInited) {
      // @ts-ignore
      window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV || "production",
      });
      paddleInited = true;
    }
    // @ts-ignore
    window.Paddle.Checkout.open({
      items: [{ priceId }],
      successUrl: "/checkout/success",
      cancelUrl: "/checkout/cancel",
    });
  } else {
    window.location.href = "#pricing"; // şimdilik demo
  }
}

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="section container">
        <div className="mx-auto max-w-3xl text-center prose-narrow">
          <h1 className="balance text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="neon-text">Create</span> Stunning Videos in Seconds
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Transform your text into high quality <span className="nowrap">videos</span>. Clear pricing, instant results.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/studio"  className="nav-btn nav-btn--primary w-full sm:w-auto text-center">Launch Studio</a>
            <a href="#pricing" className="nav-btn w-full sm:w-auto text-center">View Pricing</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Seamless Workflow",  desc: "From prompt to video in simple steps." },
            { title: "Transparent Pricing", desc: "Know exactly how many videos you get." },
            { title: "Instant Delivery",   desc: "Most videos are ready in seconds." },
            { title: "Flexible Options",   desc: "Choose with or without watermark." },
            { title: "Trusted Platform",   desc: "Clear Terms, Privacy, DMCA compliance." },
            { title: "Global Ready",       desc: "Built to scale worldwide." },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-white/70 mt-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Pricing Plans</h2>
          <p className="text-white/70 mt-2">Clear packages. Fair prices. No surprises.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.key} className="card flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl md:text-4xl font-extrabold nowrap">${p.price}</p>
                <p className="mt-1 text-sm text-white/70">
                  {p.videos} videos · <span className="nowrap">high-res</span> · <span className="nowrap">short format</span> ·{" "}
                  <span className="nowrap">{p.watermark ? "watermark" : "no watermark"}</span>
                </p>
              </div>
              <button
                onClick={() => openCheckout(p.priceId)}
                type="button"
                className="nav-btn nav-btn--primary mt-6"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="text-white/70 mt-2">Short, clear answers to common questions.</p>
        </div>

        <div className="mt-8 mx-auto max-w-3xl space-y-3">
          {/* Basit, JS gerektirmeyen <details> akordeonları */}
          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">How fast are the videos delivered?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              Most videos render in seconds. Under high load, it can take up to about a minute.
            </p>
          </details>

          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">Is there a watermark?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              Trial & Starter include a watermark. Creator & Pro remove the watermark.
            </p>
          </details>

          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">What about resolution and duration?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              All videos are high-resolution and short-form. Exact specs will be announced at launch.
            </p>
          </details>

          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">Which languages can I write prompts in?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              English and Turkish work great. Many other languages are supported as well.
            </p>
          </details>

          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">Do credits expire?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              Credits don’t expire; use them anytime.
            </p>
          </details>

          <details className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <summary className="cursor-pointer font-semibold">Is payment secure?</summary>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">
              Yes. We use Paddle for global payments (cards + Apple/Google Pay).
            </p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
}
