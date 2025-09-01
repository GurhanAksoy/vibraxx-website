"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  { key: "trial",   name: "Trial Pack",   price: 0,00, videos: 1,  watermark: true,  priceId: "price_trial_xxx" },
  { key: "starter", name: "Starter Pack", price: 0,00, videos: 5,  watermark: true,  priceId: "price_starter_xxx" },
  { key: "creator", name: "Creator Pack", price: 0,00, videos: 15, watermark: false, priceId: "price_creator_xxx" },
  { key: "pro",     name: "Pro Pack",     price: 0,00, videos: 50, watermark: false, priceId: "price_pro_xxx" },
];

const features = [
  { title: "Flexible Options",   desc: "Choose with or without watermark, as needed.", neon: "#00E5FF" },
  { title: "Seamless Workflow",  desc: "From idea to video in three simple steps.",     neon: "#7C5CFF" },
  { title: "Trusted Platform",   desc: "Clear Terms, Privacy, and DMCA compliance.",    neon: "#FF2BD6" },
  { title: "Transparent Pricing",desc: "You know exactly how many videos you get.",     neon: "#00FFA3" },
  { title: "Global Ready",       desc: "Built to scale worldwide.",                      neon: "#FFD166" },
  { title: "Instant Delivery",   desc: "Your video is ready in seconds. Ready to share.", neon: "#9AE6FF" },
];

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
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight md:leading-[1.1] tracking-tight">
            <span className="neon-word-1">Create</span>{" "}
            <span className="neon-word-2">Stunning</span>{" "}
            <span className="neon-word-3">Videos</span>{" "}
            <span className="neon-word-1">in</span>{" "}
            <span className="neon-word-2">Seconds</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Turn your text into crisp <span className="nowrap">1080p</span> clips. No credits. Clear pricing. Instant results.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/studio" className="nav-btn nav-btn--primary">Launch Studio</a>
            <a href="#pricing" className="btn-outline">View Pricing</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card neon-border neon-border--soft"
              style={{ ["--neon" as any]: f.neon }}
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-white/70 mt-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="neon-title text-3xl md:text-4xl font-extrabold">Pricing Plans</h2>
          <p className="text-white/70 mt-2">Clear packages. Fair prices. No surprises.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <div
              key={p.key}
              className="rounded-2xl p-6 border border-white/10 bg-white/5 flex flex-col justify-between neon-border"
              style={{ ["--neon" as any]: i % 2 ? "var(--v2)" : "var(--v1)" }}
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
                className="mt-6 nav-btn nav-btn--primary"
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
