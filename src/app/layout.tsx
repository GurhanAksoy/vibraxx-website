import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
  manifest: "/manifest.json",
  applicationName: "VibraXX",
  appleWebApp: {
    capable: true,
    title: "VibraXX"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020817" // ✅ doğru yer
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-[#020817] text-white antialiased"}>
        {children}

        {/* Service Worker */}
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
