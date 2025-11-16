import Image from "next/image";
import WinnerOfWeek from "@/components/WinnerOfWeek";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white">
      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24 text-center">
        <div className="mx-auto mb-6 md:mb-8 flex justify-center">
          <Image
            src="/images/vibraxx-logo.png"
            alt="VIBRAXX Logo"
            width={220}
            height={220}
            className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-contain drop-shadow-[0_0_40px_rgba(243,33,193,0.6)]"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-6xl font-extrabold leading-tight tracking-tight">
          24/7 Quiz Arena â€” Â£1/day
        </h1>

        <p className="mt-3 md:mt-4 text-base md:text-xl text-white/80 max-w-2xl mx-auto">
          Every 3 minutes a new question. Weekly prizes for top performers. No luck â€” just skill.
        </p>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <a
            href="/dashboard"
            className="btn-neon text-base md:text-lg px-5 py-3 md:px-6 md:py-3.5"
          >
            Enter the Arena â€” Â£1/Round
          </a>
          <a
            href="/(legal)/rules"
            className="underline text-white/80 hover:text-white text-sm md:text-base"
          >
            How it works
          </a>
        </div>

        <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6 opacity-80 text-xs md:text-sm">
          <span>Secure â€¢ Stripe</span>
          <span>Fair Play â€¢ Anti-Fraud</span>
          <span>GDPR/KVKK</span>
        </div>
      </section>
    </main>
  );
}


