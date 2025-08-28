"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  { key: "trial",   name: "Trial Pack",   price: 2.99, videos: 1,  watermark: true,  priceId: "price_trial_xxx" },
  { key: "starter", name: "Starter Pack", price: 9.99, videos: 5,  watermark: true,  priceId: "price_starter_xxx" },
  { key: "creator", name: "Creator Pack", price: 19.99, videos: 15, watermark: false, priceId: "price_creator_xxx" },
  { key: "pro",     name: "Pro Pack",     price: 49.99, videos: 50, watermark: false, priceId: "price_pro_xxx" },
];

// paddle init flag
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
          <h1
            className="neon-title leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3.05rem)" }} /* %15 daha küçük */
          >
            Create Stunning Videos in Seconds
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Turn your text into crisp <span className="nowrap">1080p</span> clips.
            No credits. Clear pricing. Instant results.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/studio" className="nav-btn nav-btn--primary w-full sm:w-auto text-center">Launch Studio</a>
            <a href="#pricing" className="nav-btn w-full sm:w-auto text-center">View Pricing</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Seamless Workflow",  desc: "From idea to video in three simple steps.", icon: "⚡" },
            { title: "Transparent Pricing", desc: "You know exactly how many videos you get.", icon: "💳" },
            { title: "Instant Delivery",   desc: "Your video is ready in seconds. Ready to share.", icon: "🚀" },
            { title: "Flexible Options",   desc: "Choose with or without watermark, as needed.", icon: "🧩" },
            { title: "Trusted Platform",   desc: "Clear Terms, Privacy, and DMCA compliance.", icon: "✅" },
            { title: "Global Ready",       desc: "Built to scale worldwide.", icon: "🌍" },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="flex items-center gap-3">
                <span className="feature-chip text-black/90 text-lg">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
              </div>
              <p className="feature-desc mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="neon-title" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)" }}>Pricing Plans</h2>
          <p className="text-white/70 mt-2">Clear packages. Fair prices. No surprises.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.key} className="card flex flex-col justify-between">
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
