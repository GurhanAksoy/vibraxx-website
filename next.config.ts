import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Sayaç 2x çalışmasın

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.supabase.com",
      },
    ],
  },

  // ✅ Alias çözümleme buraya gömülü olmalı, sonradan ekleme değil
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@context": path.resolve(__dirname, "src/context"),
    };
    return config;
  },
};

export default nextConfig;
