"use client";
import Image from "next/image";
import Link from "next/link";

const pill = "rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-sky-400 to-fuchsia-500 text-black shadow-[0_0_12px_rgba(124,92,255,0.35)] hover:scale-[1.02] active:scale-95 transition";
const linkBtn = "rounded-full px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 transition";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/20 border-b border-white/10">
      <nav className="container mx-auto flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="VibraXX Logo"
            width={112}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          <Link href="/announcements" className={linkBtn}>Announcements</Link>
          <Link href="/faq" className={linkBtn}>FAQ</Link>
          <Link href="/studio" className={pill}>Launch Studio</Link>
        </div>

        {/* mobile */}
        <div className="sm:hidden">
          <Link href="/studio" className={pill}>Launch Studio</Link>
        </div>
      </nav>
    </header>
  );
}
