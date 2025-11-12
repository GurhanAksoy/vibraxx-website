import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientWrapper from "./ClientWrapper";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-[#020817] text-white antialiased"}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
