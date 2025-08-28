export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between py-2 md:py-3">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="VibraXX Logo"
            className="h-8 md:h-10 lg:h-12 w-auto drop-shadow-[0_0_12px_rgba(124,92,255,0.45)]"
          />
        </a>

        {/* Menü (sade) */}
        <nav className="flex items-center gap-6 text-sm md:text-base">
          <a href="/announcements" className="nav-link">Announcements</a>
          <a href="mailto:team@vibraxx.com" className="nav-link">Contact</a>
          <a href="/studio" className="nav-btn nav-btn--primary">Launch Studio</a>
        </nav>
      </div>
    </header>
  );
}
