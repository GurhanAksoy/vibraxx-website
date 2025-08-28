"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  { key: "trial", name: "Trial Pack", price: 2.99, videos: 1, watermark: true, priceId: "price_trial_xxx" },
  { key: "starter", name: "Starter Pack", price: 9.99, videos: 5, watermark: true, priceId: "price_starter_xxx" },
  { key: "creator", name: "Creator Pack", price: 19.99, videos: 15, watermark: false, priceId: "price_creator_xxx" },
  { key: "pro", name: "Pro Pack", price: 49.99, videos: 50, watermark: false, priceId: "price_pro_xxx" },
];

function openCheckout(priceId: string) {
  // @ts-ignore
  if (window.Paddle && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
    // @ts-ignore
    window.Paddle.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV || "production",
    });
    // @ts-ignore
    window.Paddle.Checkout.open({
      items: [{ priceId }],
      successUrl: "/checkout/success",
      cancelUrl: "/checkout/cancel",
    });
  } else {
    alert("Ödeme henüz aktif değil. Lütfen kısa süre sonra tekrar deneyin.");
  }
}

export default function Home() {
  return (
    <div>
      <Navbar />
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Metinden Videoya. <span className="text-white/70">Hızlı, net, dürüst.</span>
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Luma kalitesiyle 10 saniyede 1080p videolar. Filigranlı/filigransız net seçenekler,
            coin yok, sürpriz yok.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="#pricing" className="px-5 py-3 rounded-xl bg-white text-black font-semibold">Fiyatları Gör</a>
            <a href="#features" className="px-5 py-3 rounded-xl border border-white/20 text-white">Özellikler</a>
          </div>
        </div>
      </section>

      <section id="features" className="container py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Kolay Akış", desc: "Prompt → video → indir/paylaş. 3 adım." },
            { title: "Dürüst Fiyat", desc: "Kaç video aldıysan o kadar üretim hakkı." },
            { title: "Hızlı Teslim", desc: "Global CDN ile anında indirme." },
            { title: "Filigran Seçimi", desc: "Filigranlı/filigransız net paketler." },
            { title: "Güven", desc: "ToS, Gizlilik, DMCA tam uyum." },
            { title: "Global", desc: "Çin/Rusya alt alanları için hazır mimari." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-6 border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-white/70 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="container py-16">
        <h2 className="text-3xl font-bold">Fiyatlandırma</h2>
        <p className="text-white/70 mt-2">Net paket · net fiyat · coin yok.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {plans.map((p) => (
            <div key={p.key} className="rounded-2xl p-6 border border-white/10 bg-white/5 flex flex-col">
              <div>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-extrabold">${p.price}</p>
                <p className="mt-1 text-sm text-white/70">{p.videos} video · 1080p · 10 sn {p.watermark ? "· filigranlı" : "· filigransız"}</p>
              </div>
              <button
                onClick={() => openCheckout(p.priceId)}
                className="mt-6 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90"
              >
                Satın Al
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
