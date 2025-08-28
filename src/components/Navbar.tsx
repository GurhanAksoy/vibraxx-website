"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <nav className="container flex items-center justify-between py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="VibraXX Logo"
            width={128}
            height={40}
            priority
            className="h-9 w-auto"
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
          onClick={() => setOpen(v => !v)}
        >
          Menu
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/40">
          <div className="container py-3 flex flex-col gap-2">
            <Link href="/announcements" className="nav-btn" onClick={() => setOpen(false)}>Announcements</Link>
            <Link href="/faq" className="nav-btn" onClick={() => setOpen(false)}>FAQ</Link>
            <Link href="/studio" className="nav-btn nav-btn--primary" onClick={() => setOpen(false)}>Launch Studio</Link>
          </div>
        </div>
      )}
    </header>
  );
}
