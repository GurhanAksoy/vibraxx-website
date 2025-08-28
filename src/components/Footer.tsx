export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 mt-16 py-6 text-center text-sm text-white/60">
      <p>© {new Date().getFullYear()} VibraXX. All rights reserved.</p>
      <div className="mt-2 flex justify-center gap-6">
        <a href="/terms" className="hover:text-white">Terms</a>
        <a href="/privacy" className="hover:text-white">Privacy</a>
        <a href="mailto:team@vibraxx.com" className="hover:text-white">Contact</a>
      </div>
    </footer>
  );
}
