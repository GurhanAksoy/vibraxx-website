/**
 * useNextRound Hook
 * 
 * Ana sayfa ve Lobby sayfası için senkronize countdown
 * - Aynı Supabase query
 * - Real-time subscription
 * - UTC+0 timezone consistency
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface NextRound {
  id: number;
  round_number: number;
  status: 'scheduled' | 'live' | 'finished';
  scheduled_start: string;
  actual_start: string | null;
  actual_end: string | null;
}

interface UseNextRoundReturn {
  nextRound: NextRound | null;
  timeUntilStart: number; // seconds
  formattedCountdown: string; // "04:21"
  lobbyStatus: 'open' | 'closed' | 'loading';
  isLoading: boolean;
  error: string | null;
}

export function useNextRound(): UseNextRoundReturn {
  const [nextRound, setNextRound] = useState<NextRound | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch - Bir sonraki scheduled round
  useEffect(() => {
    const fetchNextRound = async () => {
      try {
        const { data, error } = await supabase
          .from('overlay_round_state')
          .select('*')
          .eq('status', 'scheduled')
          .order('scheduled_start', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching next round:', error);
          setError('Could not load next round');
        } else if (data) {
          setNextRound(data);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextRound();
  }, []);

  // Real-time subscription - Round state değişikliklerini dinle
  useEffect(() => {
    const channel = supabase
      .channel('next_round_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overlay_round_state',
        },
        (payload) => {
          // Yeni scheduled round geldi veya mevcut güncellendi
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRound = payload.new as NextRound;
            
            // Sadece scheduled olanları al
            if (newRound.status === 'scheduled') {
              setNextRound(newRound);
            }
            
            // Eğer mevcut round live oldu, bir sonrakini fetch et
            if (payload.eventType === 'UPDATE' && newRound.status === 'live') {
              fetchNextScheduled();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper: Bir sonraki scheduled round'u fetch et
  const fetchNextScheduled = async () => {
    const { data } = await supabase
      .from('overlay_round_state')
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_start', { ascending: true })
      .limit(1)
      .single();

    if (data) {
      setNextRound(data);
    }
  };

  // Countdown timer - UTC+0 based, her saniye güncelle
  useEffect(() => {
    if (!nextRound?.scheduled_start) {
      setTimeUntilStart(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const scheduledStart = new Date(nextRound.scheduled_start);
      const diffMs = scheduledStart.getTime() - now.getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      
      setTimeUntilStart(diffSec);
    };

    // İlk güncelleme
    updateCountdown();

    // Her saniye güncelle
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextRound]);

  // Format countdown: "04:21" veya "00:15"
  const formattedCountdown = formatCountdown(timeUntilStart);

  // Lobby durumu
  const lobbyStatus = isLoading 
    ? 'loading' 
    : timeUntilStart > 0 
      ? 'open' 
      : 'closed';

  return {
    nextRound,
    timeUntilStart,
    formattedCountdown,
    lobbyStatus,
    isLoading,
    error,
  };
}

/**
 * Format saniye countdown'unu MM:SS formatına çevir
 */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * UTC time'ı formatla: "18:15 UTC"
 */
export function formatUTCTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} UTC`;
}
