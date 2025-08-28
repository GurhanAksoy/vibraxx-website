import type { Metadata } from "next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "VibraXX — Text to Video",
  description: "Create high-quality 1080p videos from text. Simple. Transparent. Professional.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.paddle.com/paddle/v2/paddle.js" defer></script>
      </head>
      <body className={`${inter.className} min-h-screen gradient antialiased`}>{children}</body>
    </html>
  );
}
