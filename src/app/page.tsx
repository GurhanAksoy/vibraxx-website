"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  { key: "trial",   name: "Trial Pack",   price: 2.99, videos: 1,  watermark: true,  priceId: "price_trial_xxx" },
  { key: "starter", name: "Starter Pack", price: 9.99, videos: 5,  watermark: true,  priceId: "price_starter_xxx" },
  { key: "creator", name: "Creator Pack", price: 19.99, videos: 15, watermark: false, priceId: "price_creator_xxx" },
  { key: "pro",     name: "Pro Pack",     price: 49.99, videos: 50, watermark: false, priceId: "price_pro_xxx" },
];

// Paddle'ı tekrar tekrar init etmemek için basit bayrak
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
    alert("Checkout will be available shortly. Please try again in a moment.");
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
  <span className="inline-block">
    <span className="neon-letter" style={{["--c" as any]:"#00E5FF"}}>C</span>
    <span className="neon-letter" style={{["--c" as any]:"#7C5CFF"}}>r</span>
    <span className="neon-letter" style={{["--c" as any]:"#FF2BD6"}}>e</span>
    <span className="neon-letter" style={{["--c" as any]:"#00FFA3"}}>a</span>
    <span className="neon-letter" style={{["--c" as any]:"#FFD166"}}>t</span>
    <span className="neon-letter" style={{["--c" as any]:"#FF7EB3"}}>e</span>
  </span>{" "}
  Stunning Videos in Seconds
</h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Transform your text into high quality <span className="nowrap">1080p</span> videos.
            No hidden fees or confusing credits. Clear pricing and instant results.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#pricing"
              className="px-5 py-3 rounded-xl bg-white text-black font-semibold w-full sm:w-auto text-center"
            >
              View Pricing
            </a>
            <a
              href="#features"
              className="px-5 py-3 rounded-xl border border-white/20 text-white w-full sm:w-auto text-center"
            >
              Features
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Seamless Workflow",  desc: "From idea to video in three simple steps." },
            { title: "Transparent Pricing", desc: "You know exactly how many videos you get." },
            { title: "Instant Delivery",   desc: "Your video is ready in seconds. Ready to share." },
            { title: "Flexible Options",   desc: "Choose with or without watermark, as needed." },
            { title: "Trusted Platform",   desc: "Clear Terms, Privacy, and DMCA compliance." },
            { title: "Global Ready",       desc: "Built to scale worldwide." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-6 border border-white/10 bg-white/5">
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
            <div
              key={p.key}
              className="rounded-2xl p-6 border border-white/10 bg-white/5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl md:text-4xl font-extrabold nowrap">${p.price}</p>
                <p className="mt-1 text-sm text-white/70">
                  {p.videos} videos · <span className="nowrap">1080p</span> · <span className="nowrap">10&nbsp;s</span>
                  {p.watermark ? " · watermark" : " · no watermark"}
                </p>
              </div>
              <button
                onClick={() => openCheckout(p.priceId)}
                type="button"
                className="mt-6 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
