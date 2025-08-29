// src/app/layout.tsx
import "./globals.css";
import Nav from "@/components/Nav";        // senin dosya yolun
import Footer from "@/components/Footer";  // senin dosya yolun

export const metadata = {
  title: "VibraXX",
  description: "Create stunning videos in seconds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white">
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
