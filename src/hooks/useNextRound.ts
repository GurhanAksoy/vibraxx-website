import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface NextRound {
  id: number;
  scheduled_start: string;
  status: 'scheduled' | 'live' | 'finished';
  round_duration_seconds: number;
}

export function useNextRound() {
  const [nextRound, setNextRound] = useState<NextRound | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roundRef = useRef<NextRound | null>(null);

  // ================= FETCH =================

  const fetchNextRound = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('id, scheduled_start, status, round_duration_seconds')
        .eq('status', 'scheduled')
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNextRound(null);
          roundRef.current = null;
          setTimeUntilStart(0);
          return;
        }
        throw error;
      }

      setNextRound(data);
      roundRef.current = data;
      setError(null);
    } catch (e) {
      console.error('[useNextRound] fetch error:', e);
      setError('Could not load next round');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================= INITIAL =================

  useEffect(() => {
    fetchNextRound();
  }, [fetchNextRound]);

  // ================= REALTIME =================

  useEffect(() => {
    const channel = supabase
      .channel(`rounds_next_sync_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        () => fetchNextRound()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNextRound]);

  // ================= CANONICAL TIMER =================

  useEffect(() => {
    const tick = () => {
      if (!roundRef.current) return;

      const target = new Date(roundRef.current.scheduled_start).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));

      setTimeUntilStart(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ================= DERIVED =================

  const formattedCountdown = formatCountdown(timeUntilStart);
  const lobbyStatus =
    isLoading ? 'loading' : timeUntilStart > 0 ? 'open' : 'closed';

  return {
    nextRound,
    timeUntilStart,
    formattedCountdown,
    lobbyStatus,
    isLoading,
    error,
    reload: fetchNextRound,
  };
}

// ================= HELPERS =================

function formatCountdown(seconds: number) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}
