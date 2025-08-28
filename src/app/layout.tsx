import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "VibraXX — Text to Video",
  description: "Luma kalitesinde hızlı ve dürüst fiyatlı video üretimi.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Paddle v2 (opsiyonel: env ile açılır) */}
        <script src="https://cdn.paddle.com/paddle/v2/paddle.js" defer></script>
      </head>
      <body className="min-h-screen gradient">{children}</body>
    </html>
  );
}
