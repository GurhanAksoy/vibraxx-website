// src/app/announcements/page.tsx
export default function AnnouncementsPage() {
  return (
    <div className="container section">
      <h1 className="text-3xl md:text-4xl font-bold">Announcements</h1>
      <p className="text-white/70 mt-2">
        Updates about VibraXX will appear here.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold">Welcome to VibraXX</h3>
          <p className="text-sm text-white/70 mt-1">
            We’re preparing our global launch. Stay tuned.
          </p>
        </div>
      </div>
    </div>
  );
}
