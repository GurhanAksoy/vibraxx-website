export default function Navbar() {
  return (
    <header className="border-b border-white/10">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white/10" />
          <span className="font-semibold tracking-wide">VibraXX</span>
        </div>
        <nav className="text-sm text-white/70 flex gap-6">
          <a href="#features" className="hover:text-white">Özellikler</a>
          <a href="#pricing" className="hover:text-white">Fiyatlar</a>
          <a href="/terms" className="hover:text-white">Şartlar</a>
        </nav>
      </div>
    </header>
  );
}
