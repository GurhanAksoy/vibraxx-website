import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function PlayerCount({ roundId, className = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!roundId) return;

    let alive = true;

    const fetchCount = async () => {
      const { data, error } = await supabase.rpc("get_round_presence", {
        p_round_id: roundId,
      });

      if (!error && alive) setCount(data || 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000); // 10 sn

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [roundId]);

  if (!roundId) return null;

  return (
    <div className={className}>
      <span>{count.toLocaleString()}</span> players ready
    </div>
  );
}
