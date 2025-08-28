"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <nav className="container flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3" aria-label="VibraXX Home">
            <Image
              src="/logo-vibraxx.png"
              alt="VibraXX Logo"
              width={120}
              height={32}
              priority
            />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/announcements" className="nav-btn">Announcements</Link>
            <Link href="/faq" className="nav-btn">FAQ</Link>
            <Link href="/studio" className="nav-btn nav-btn--primary">Launch Studio</Link>
          </div>

          {/* Mobile trigger */}
          <button
            className="md:hidden nav-btn"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 bg-[#121218] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Image src="/logo-vibraxx.png" alt="VibraXX" width={110} height={28}/>
              <button className="nav-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <Link onClick={() => setOpen(false)} href="/announcements" className="nav-btn">Announcements</Link>
              <Link onClick={() => setOpen(false)} href="/faq" className="nav-btn">FAQ</Link>
              <Link onClick={() => setOpen(false)} href="/studio" className="nav-btn nav-btn--primary">Launch Studio</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
