export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between py-3 md:py-4">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="VibraXX Logo"
            className="h-14 md:h-16 lg:h-20 w-auto drop-shadow-[0_0_16px_rgba(124,92,255,0.45)]"
          />
        </a>

        {/* Menü */}
        <nav className="text-base md:text-lg text-white/70 flex gap-8">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="mailto:team@vibraxx.com" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
