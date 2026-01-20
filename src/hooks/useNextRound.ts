/**
 * useNextRound Hook - OPTIMIZED v2.0
 * 
 * ✅ Briefing-compliant (rounds table)
 * ✅ Real-time subscription (filtered)
 * ✅ Client-side countdown (1s interval)
 * ✅ Server sync (30s interval, drift prevention)
 * ✅ Smart loading states (no UI jumps)
 * ✅ Error handling with retry
 * 
 * USAGE:
 * const { timeUntilStart, formattedCountdown, lobbyStatus, nextRound } = useNextRound();
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// ==================== TYPES ====================

interface NextRound {
  id: number;
  scheduled_start: string;
  status: 'scheduled' | 'live' | 'finished';
  round_duration_seconds: number;
}

interface UseNextRoundReturn {
  nextRound: NextRound | null;
  timeUntilStart: number; // seconds
  formattedCountdown: string; // "04:21"
  lobbyStatus: 'open' | 'closed' | 'loading';
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

// ==================== HOOK ====================

export function useNextRound(): UseNextRoundReturn {
  // State
  const [nextRound, setNextRound] = useState<NextRound | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH NEXT ROUND ====================
  
  const fetchNextRound = useCallback(async () => {
    try {
      // Only show loading on initial load (prevent UI jumps on sync)
      if (isInitialLoad) {
        setIsLoading(true);
      }
      
      const { data, error: queryError } = await supabase
        .from('rounds')
        .select('id, scheduled_start, status, round_duration_seconds')
        .eq('status', 'scheduled')
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .single();

      // Handle errors
      if (queryError) {
        // PGRST116 = No rows found (not an error, just no scheduled rounds)
        if (queryError.code === 'PGRST116') {
          console.log('[useNextRound] No scheduled rounds found');
          setNextRound(null);
          setTimeUntilStart(0);
          setError(null);
        } else {
          console.error('[useNextRound] Query error:', queryError);
          setError('Could not load next round');
        }
        return;
      }

      // Success - update round data
      if (data) {
        setNextRound(data);
        setError(null);
        
        // Calculate initial countdown (deterministic from scheduled_start)
        const startTime = new Date(data.scheduled_start).getTime();
        const now = Date.now();
        const seconds = Math.floor((startTime - now) / 1000);
        
        setTimeUntilStart(Math.max(0, seconds));
        
        console.log('[useNextRound] Round loaded:', {
          id: data.id,
          scheduled_start: data.scheduled_start,
          countdown: seconds
        });
      }

    } catch (err) {
      console.error('[useNextRound] Unexpected error:', err);
      setError('Unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // ==================== INITIAL FETCH ====================
  
  useEffect(() => {
    fetchNextRound();
  }, [fetchNextRound]);

  // ==================== REAL-TIME SUBSCRIPTION ====================
  
  useEffect(() => {
    const channel = supabase
      .channel('next_round_sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: 'status=eq.live' // 🎯 OPTIMIZED: Only listen for rounds going live
        },
        (payload) => {
          console.log('[useNextRound] Round went live, fetching next scheduled round');
          fetchNextRound();
        }
      )
      .subscribe();

    console.log('[useNextRound] Real-time subscription active');

    return () => {
      console.log('[useNextRound] Unsubscribing from real-time');
      supabase.removeChannel(channel);
    };
  }, [fetchNextRound]);

  // ==================== CLIENT-SIDE COUNTDOWN ====================
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 🎯 OPTIMIZED: Simple decrement, no fetch (30s sync handles it)
      setTimeUntilStart(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==================== SERVER SYNC (30s) ====================
  
  useEffect(() => {
    const syncInterval = setInterval(() => {
      console.log('[useNextRound] 30s sync - preventing drift');
      fetchNextRound();
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [fetchNextRound]);

  // ==================== DERIVED VALUES ====================

  // Format countdown: MM:SS
  const formattedCountdown = formatCountdown(timeUntilStart);

  // Lobby status: open (countdown > 0), closed (0), loading
  const lobbyStatus = isLoading 
    ? 'loading' 
    : timeUntilStart > 0 
      ? 'open' 
      : 'closed';

  // ==================== RETURN ====================

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

// ==================== HELPER FUNCTIONS ====================

/**
 * Format countdown seconds to MM:SS
 */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format UTC time from ISO string: "18:15 UTC"
 */
export function formatUTCTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} UTC`;
}

/**
 * Get human-readable time remaining
 * Examples: "4 minutes", "30 seconds", "Starting soon!"
 */
export function getTimeRemainingText(seconds: number): string {
  if (seconds <= 0) return 'Starting soon!';
  if (seconds < 60) return `${seconds} seconds`;
  
  const mins = Math.floor(seconds / 60);
  if (mins === 1) return '1 minute';
  
  return `${mins} minutes`;
}
