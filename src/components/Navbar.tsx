export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between py-2 md:py-3">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="VibraXX Logo"
            className="h-12 md:h-14 lg:h-16 w-auto drop-shadow-[0_0_12px_rgba(124,92,255,0.45)]"
          />
        </a>

        {/* Menü */}
        <nav className="text-sm text-white/70 flex gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="mailto:team@vibraxx.com" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
