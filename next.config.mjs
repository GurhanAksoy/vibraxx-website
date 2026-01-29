import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.supabase.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },

  // 🔥 KRİTİK FIX
  async rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/public/manifest.json",
      },
    ];
  },
};

export default nextConfig;
