import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VibraXX — Text to Video",
  description: "Generate 1080p short videos from text with clear pricing and instant results.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="gradient min-h-screen">{children}</div>
      </body>
    </html>
  );
}
