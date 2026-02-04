import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
  applicationName: "VibraXX",
  manifest: "/manifest",
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
        {/* 🔻 PRELOAD FADE-OUT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                const el = document.getElementById('vibraxx-preload-bg');
                if (el) {
                  el.style.opacity = '0';
                  setTimeout(() => {
                    if (el && el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
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
              // ═══ SERVICE WORKER REGISTER ═══
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
                    console.log('[PWA] Service Worker registered');
                    
                    if (reg.waiting) {
                      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    
                    reg.addEventListener('updatefound', () => {
                      const newWorker = reg.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] New version available');
                          }
                        });
                      }
                    });
                  }).catch(err => {
                    console.error('[PWA] Service Worker registration failed:', err);
                  });
                });
              }
              
              // ═══ PWA INSTALL PROMPT (Android Chrome, Edge) ═══
              let deferredPrompt = null;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('[PWA] Install prompt available');
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install banner after 2 seconds
                setTimeout(() => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                      console.log('[PWA] User choice:', choiceResult.outcome);
                      deferredPrompt = null;
                    });
                  }
                }, 2000);
              });
              
              // ═══ PWA INSTALL SUCCESS ═══
              window.addEventListener('appinstalled', () => {
                console.log('[PWA] App installed successfully');
                deferredPrompt = null;
              });
              
              // ═══ iOS DETECTION (Safari) ═══
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
              const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
              
              if (isIOS && !isStandalone) {
                console.log('[PWA] iOS detected - Manual install: Share → Add to Home Screen');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
