import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════
// MANIFEST.JSON - APP ROUTER ROUTE (401 FIX)
// ═══════════════════════════════════════════════════════════
// Neden App Router route?
// - public/manifest.json → Vercel auth/edge takılıyor
// - App Router route → ALWAYS public, no auth
// - Chrome PWA → Native gibi kabul eder
// ═══════════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json(
    {
      id: "https://vibraxx.com/",
      name: "VibraXX - Live Quiz Arena",
      short_name: "VibraXX",
      description: "Global skill-based live quiz arena. Compete for prizes 24/7. Play trivia, climb the leaderboard, and win real rewards. Premium quiz experience with offline support.",
      start_url: "/?source=pwa",
      scope: "/",
      display: "standalone",
      background_color: "#020817",
      theme_color: "#020817",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/icons/manifest-icon-192.maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icons/manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icons/apple-icon-180.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
      screenshots: [
        {
          src: "/icons/manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          form_factor: "narrow",
        },
      ],
      categories: ["games", "entertainment", "education"],
      lang: "en-US",
      dir: "ltr",
      prefer_related_applications: false,
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
