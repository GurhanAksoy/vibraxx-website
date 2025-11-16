import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "VIBRAXX - 24/7 Quiz Arena",
  description: "Global skill-based quiz arena.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body className={inter.className + " bg-[#020817] text-white antialiased"}>
        {children}
      </body>
    </html>
  );
}
