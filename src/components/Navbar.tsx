"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Route değişince mobil menüyü kapat
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/announcements", label: "Announcements" },
    { href: "/faq",            label: "FAQ" },
  ];

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20">
      <nav className="container flex items-center justify-between py-3">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="VibraXX Home">
          <Image
            src="/logo.png"       // public/logo.png
            alt="VibraXX"
            width={36}
            height={36}
            priority
            className="h-9 w-9 select-none"
          />
          <span className="sr-only">VibraXX</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-btn ${isActive(l.href) ? "ring-1 ring-white/30" : ""}`}
            >
              {l.label}
            </Link>
          ))}

          <Link href="/studio" className="nav-btn nav-btn--primary ml-2">
            Launch Studio
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden nav-btn"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur">
          <div className="container py-3 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-btn ${isActive(l.href) ? "ring-1 ring-white/30" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/studio" className="nav-btn nav-btn--primary">
              Launch Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
