"use client";
import { motion } from "framer-motion";

export default function Overlay() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05060A] text-white font-[Poppins] -translate-y-[30%]">

      {/* Neon hareketli arka plan */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-30"
        animate={{
          background: [
            "radial-gradient(900px 700px at 30% 30%, rgba(33,243,243,0.4), transparent), radial-gradient(900px 700px at 70% 70%, rgba(243,33,193,0.4), transparent), #05060A",
            "radial-gradient(900px 700px at 70% 30%, rgba(243,33,193,0.4), transparent), radial-gradient(900px 700px at 30% 70%, rgba(33,243,243,0.4), transparent), #05060A",
          ],
        }}
        transition={{ duration: 10, repeat: 999999, repeatType: "reverse" }}
      />

      {/* OrtalanmÄ±ÅŸ bÃ¼yÃ¼k logo */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 flex justify-center">
        <img
          src="/images/vibraxx-logo.png"
          alt="VIBRAXX"
          className="w-[320px] h-[320px] object-contain drop-shadow-[0_0_90px_rgba(243,33,193,0.9)]"
        />
      </div>

      {/* SayaÃ§ (logo hizasÄ±nda) */}
      <div className="absolute top-[30%] right-[12%] text-center">
        <div className="text-sm uppercase tracking-widest text-white/70">TIME LEFT</div>
        <div className="text-6xl font-bold text-[#21F3F3] drop-shadow-[0_0_25px_rgba(33,243,243,0.6)]">15s</div>
      </div>

      {/* Soru KartÄ± (%10 aÅŸaÄŸÄ± alÄ±ndÄ±) */}
      <div className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 text-center w-[70%]">
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-10 shadow-[0_0_40px_rgba(33,243,243,0.25)]">
          <h2 className="text-3xl font-semibold mb-6">What is the capital of Japan?</h2>
          <div className="grid grid-cols-2 gap-4">
            {["Seoul", "Beijing", "Tokyo", "Osaka"].map((a, i) => (
              <div
                key={i}
                className="py-4 px-6 bg-gradient-to-br from-[#0D0E13] to-[#14151A] rounded-xl border border-white/10 text-lg hover:from-[#1A1B22] hover:to-[#24252B] transition-all duration-200 shadow-[0_0_20px_rgba(243,33,193,0.3)]"
              >
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}


