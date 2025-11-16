export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-8 text-center text-sm text-white/70">
      <p className="mb-2">
        Â© {new Date().getFullYear()} <strong>VIBRAXX</strong> â€” a skill-based competition operated by Sermin Limited (UK)
      </p>
      <div className="flex items-center justify-center gap-6">
        <a href="/legal/terms" className="hover:text-[var(--c-cyan)]">Terms</a>
        <a href="/legal/rules" className="hover:text-[var(--c-cyan)]">Rules</a>
        <a href="/legal/privacy" className="hover:text-[var(--c-cyan)]">Privacy</a>
      </div>
      <p className="mt-4 text-xs text-white/40">
        VIBRAXX is a skill-based trivia platform â€” no gambling, no random outcomes.
      </p>
    </footer>
  );
}


