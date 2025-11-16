"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function WinnerOfWeek({ name = "John Carter", score = 47, prize = 100, avatar = "/images/crown.png" }) {
  return (
    <motion.div
      className="relative mx-auto mt-12 max-w-md text-center rounded-2xl p-6 
                 bg-gradient-to-br from-[#1A1B25] to-[#0B0C10] border border-yellow-400/60 
                 shadow-[0_0_30px_rgba(255,215,0,0.4)] backdrop-blur-md"
      animate={{ boxShadow: ["0 0 25px #FFD700", "0 0 40px #FFDD77", "0 0 25px #FFD700"] }}
      transition={{ duration: 2, repeat: 999999, repeatType: "reverse" }}
    >
      <div className="flex flex-col items-center">
        <Image
          src={avatar}
          alt="Champion"
          width={120}
          height={120}
          className="mb-4 drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]"
        />
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-2">ğŸ† Winner of the Week</h2>
        <p className="text-white text-lg font-semibold">{name}</p>
        <p className="text-yellow-400 mt-2">Score: {score} correct</p>
        <p className="text-yellow-500 font-bold text-xl mt-2">Â£{prize}</p>
        <p className="text-white/70 text-sm mt-4">
          Think you can beat this score?{" "}
          <a href="/dashboard" className="text-yellow-400 underline">Join the arena!</a>
        </p>
      </div>
    </motion.div>
  );
}


