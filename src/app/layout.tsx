import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
  applicationName: "VibraXX",

  // ❌ BUNU SİLDİK → 401 crash sebebiydi
  // manifest: "/manifest.json",

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
        {/* ✅ MANUEL MANIFEST (safe path) */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS / PWA */}
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>

      <body className={`${inter.className} bg-[#020817] text-white antialiased`}>

        {/* 🔲 PRELOAD OVERLAY */}
        <div
          id="vibraxx-preload-bg"
          style={{
            position: "fixed",
            inset: 0,
            background: "#020817",
            zIndex: 9999,
            opacity: 1,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}
        />

        {children}

        {/* 🔻 PRELOAD FADE-OUT (SAFE) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                const el = document.getElementById('vibraxx-preload-bg');
                if (el) {
                  el.style.opacity = '0';
                  setTimeout(() => {
                    try { el.remove(); } catch(e) {}
                  }, 600);
                }
              });
            `,
          }}
        />

        {/* 🔧 SERVICE WORKER + PWA INSTALL HANDLER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(reg => {
                      console.log('[PWA] Service Worker registered');
                      if (reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                      }
                    })
                    .catch(err => console.error('[PWA] SW error:', err));
                });
              }

              let deferredPrompt = null;

              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                setTimeout(() => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                  }
                }, 2000);
              });

              window.addEventListener('appinstalled', () => {
                deferredPrompt = null;
              });

              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
              if (isIOS && !isStandalone) {
                console.log('[PWA] iOS manual install required');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
