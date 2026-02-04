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
      // ═══ EXISTING (korundu) ═══
      { 
        protocol: "https", 
        hostname: "lh3.googleusercontent.com" 
      },
      { 
        protocol: "https", 
        hostname: "avatars.githubusercontent.com" 
      },
      { 
        protocol: "https", 
        hostname: "cdn.supabase.com" 
      },
      { 
        protocol: "https", 
        hostname: "api.dicebear.com" 
      },
      
      // ═══ YENİ: Supabase Storage (avatar için) ═══
      { 
        protocol: "https", 
        hostname: "iugucppccgpnnduhyhqo.supabase.co",  // ← YOUR_PROJECT_ID
        pathname: "/storage/v1/object/**",  // Storage path pattern
      },
    ],
    
    // ═══ OPTIMIZE: Image optimization ayarları ═══
    formats: ["image/avif", "image/webp"],  // Modern formats
    minimumCacheTTL: 60 * 60 * 24 * 30,  // 30 gün cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],  // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // Icon sizes
  },
  
  // ═══ OPTIMIZE: Production optimizations ═══
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ["error", "warn"] }  // console.log'ları sil (error/warn kalsın)
      : false,
  },
  
  // ═══ OPTIMIZE: Performance ═══
  experimental: {
    optimizePackageImports: ["lucide-react"],  // Icon tree-shaking
  },
  
  // ═══ OPTIMIZE: Security Headers ═══
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      // PWA Files - Correct MIME types
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
