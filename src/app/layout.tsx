import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientScripts from "./client-scripts";
import PreloadOverlay from "@/components/PreloadOverlay";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
  applicationName: "VibraXX",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "VibraXX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020817",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* THEME */}
        <meta name="theme-color" content="#020817" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ICONS */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-icon-180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/manifest-icon-192.maskable.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/manifest-icon-512.maskable.png"
        />
      </head>

      <body
        className={`${inter.className} bg-[#020817] text-white antialiased`}
      >
        {/* ✅ REACT-CONTROLLED PRELOAD (SAFE) */}
        <PreloadOverlay />

        {/* APP */}
        {children}

        {/* CLIENT ONLY LOGIC */}
        <ClientScripts />
      </body>
    </html>
  );
}
