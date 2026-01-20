/**
 * PlayerCount Component
 * 
 * Real-time player count for a specific round
 * Ana sayfa ve Lobby'de kullanılır - aynı data source
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PlayerCountProps {
  roundId: number | null | undefined;
  className?: string;
}

export function PlayerCount({ roundId, className = '' }: PlayerCountProps) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roundId) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    // Initial count fetch
    const fetchCount = async () => {
      const { count: initialCount, error } = await supabase
        .from('round_participants')
        .select('*', { count: 'exact', head: true })
        .eq('round_id', roundId);

      if (!error) {
        setCount(initialCount || 0);
      }
      setIsLoading(false);
    };

    fetchCount();

    // Real-time subscription - Yeni katılımcıları dinle
    const channel = supabase
      .channel(`participants_${roundId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'round_participants',
          filter: `round_id=eq.${roundId}`,
        },
        () => {
          // Yeni participant eklendi, count'u artır
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roundId]);

  if (isLoading || !roundId) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 500,
      }}
    >
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#22c55e',
        }}
      />
      <span style={{ color: '#ffffff', fontWeight: 600 }}>
        {count.toLocaleString()}
      </span>
      <span>players ready</span>
    </div>
  );
}
