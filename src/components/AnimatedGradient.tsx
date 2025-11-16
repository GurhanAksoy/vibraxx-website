"use client";
import { motion } from "framer-motion";

export default function AnimatedGradient() {
  return (
    <motion.div
      className="fixed inset-0 -z-10"
      animate={{
        background: [
          "radial-gradient(circle at 30% 30%, rgba(33,243,243,0.3), transparent), radial-gradient(circle at 70% 70%, rgba(243,33,193,0.3), transparent), #0B0C10",
          "radial-gradient(circle at 70% 30%, rgba(243,33,193,0.3), transparent), radial-gradient(circle at 30% 70%, rgba(33,243,243,0.3), transparent), #0B0C10",
        ],
      }}
      transition={{
        duration: 8,
        repeat: 999999,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      style={{ width: "100%", height: "100%", filter: "blur(80px)", opacity: 0.9 }}
    />
  );
}


