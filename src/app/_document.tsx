import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body
        style={{
          backgroundColor: "#020817",
          color: "#ffffff",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {/* Koyu preload katmanı */}
        <div
          id="vibraxx-preload-bg"
          style={{
            position: "fixed",
            inset: 0,
            background: "#020817",
            zIndex: 9999,
            opacity: 1,
            transition: "opacity 0.5s ease",
          }}
        />

        <Main />
        <NextScript />

        {/* Yükleme tamamlanınca fade-out */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                const el = document.getElementById('vibraxx-preload-bg');
                if (el) {
                  el.style.opacity = '0';
                  setTimeout(() => el.remove(), 600);
                }
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}
