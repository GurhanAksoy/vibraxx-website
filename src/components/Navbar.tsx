export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between py-3">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="VibraXX Logo"
            className="h-10 w-auto"
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
