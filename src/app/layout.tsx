// src/app/layout.tsx
import "../styles/globals.css";               // globals.css artık styles klasöründe
import Navbar from "@/components/Navbar";      // dosya adı Navbar.tsx ise
import Footer from "@/components/Footer";

export const metadata = {
  title: "VibraXX",
  description: "Create stunning videos in seconds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
