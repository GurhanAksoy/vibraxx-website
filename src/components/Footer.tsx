export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="container py-10 text-sm text-white/60 flex flex-col sm:flex-row gap-3 justify-between">
        <p>© {new Date().getFullYear()} VibraXX</p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-white/90">Gizlilik</a>
          <a href="/content-policy" className="hover:text-white/90">İçerik Politikası</a>
          <a href="/dmca" className="hover:text-white/90">DMCA</a>
        </div>
      </div>
    </footer>
  );
}
