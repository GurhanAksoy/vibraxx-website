"use client";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/champions");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-white/70 mt-10">
        Loading leaderboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-red-400 mt-10">
        No leaderboard data available.
      </div>
    );
  }

  const Section = ({ title, list }: { title: string; list: any[] }) => (
    <div className="bg-[#0A0B0F]/80 border border-[#21F3F3]/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_20px_#21F3F3,0_0_40px_#F321C1] w-[90%] sm:w-[360px] mx-auto mb-6">
      <h2 className="text-lg sm:text-xl font-bold text-center text-[#21F3F3] mb-3">
        {title}
      </h2>
      {list.length === 0 ? (
        <p className="text-center text-white/60 text-sm">No results yet</p>
      ) : (
        <ul className="space-y-2">
          {list.map((p, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-[#111]/70 px-3 py-2 rounded-lg border border-[#21F3F3]/30 text-white/90"
            >
              <span className="font-semibold text-[#F321C1]">
                #{i + 1}
              </span>
              <span className="text-sm">
                {p.user?.full_name || `Player ${i + 1}`}
              </span>
              <span className="font-bold text-[#21F3F3]">
                {p.accuracy ?? 0}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center mt-20 mb-16 text-white">
      <Section title="ğŸ† Round Champion" list={data.roundChampion || []} />
      <Section title="â˜€ï¸ Todayâ€™s Top 3" list={data.dayTop || []} />
      <Section title="ğŸ“† This Weekâ€™s Top 3" list={data.weekTop || []} />
      <Section title="ğŸª™ This Monthâ€™s Top 3" list={data.monthTop || []} />
    </div>
  );
}


