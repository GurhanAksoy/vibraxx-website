import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
  manifest: "/manifest.json",
  themeColor: "#020817",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibraXX"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className + " bg-[#020817] text-white antialiased"}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
