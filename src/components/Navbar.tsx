export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between py-3">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="VibraXX" className="h-7 w-auto" />
        </a>
        <nav className="text-sm text-white/70 flex gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
          <a href="mailto:team@vibraxx.com" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
