import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ApiDeviationResult } from '../types';

interface UseDeviationsOptions {
  limit?: number;
  offset?: number;
  timeControl?: 'bullet' | 'blitz' | 'rapid' | 'classical';
  reviewed?: boolean;
}

interface UseDeviationsResult {
  deviations: ApiDeviationResult[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Hook for fetching and managing user deviations
 * Integrates with Auth.js and Supabase RLS
 */
export function useDeviations(options: UseDeviationsOptions = {}): UseDeviationsResult {
  const { session } = useAuth();
  const [deviations, setDeviations] = useState<ApiDeviationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(options.offset || 0);

  const fetchDeviations = useCallback(
    async (currentOffset: number = 0, append: boolean = false) => {
      if (!session?.user?.id) {
        setDeviations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build query
        let query = supabase
          .from('opening_deviations')
          .select(
            'id, user_id, study_id, game_id, position_fen, expected_move, actual_move, move_number, color, detected_at, reviewed_at, review_result, pgn',
            { count: 'exact' }
          )
          .eq('user_id', session.user.id)
          .order('detected_at', { ascending: false })
          .limit(options.limit || 10)
          .range(currentOffset, currentOffset + (options.limit || 10) - 1);

        // Apply filters
        if (options.timeControl) {
          query = query.eq('time_control', options.timeControl);
        }
        if (options.reviewed !== undefined) {
          query = query.eq('review_result', options.reviewed ? 'reviewed' : 'not_reviewed');
        }

        const { data, error: queryError, count } = await query;

        if (queryError) {
          throw queryError;
        }

        // Map DB fields to ApiDeviationResult
        const mappedData: ApiDeviationResult[] = (data || []).map((row: unknown) => {
          const r = row as Record<string, unknown>;
          return {
            id: r.id as string,
            user_id: r.user_id as string,
            study_id: r.study_id as string,
            game_id: r.game_id as string,
            position_fen: r.position_fen as string,
            expected_move: r.expected_move as string,
            actual_move: r.actual_move as string,
            move_number: r.move_number as number,
            color: r.color as string,
            detected_at: r.detected_at as string,
            reviewed_at: r.reviewed_at as string | null,
            review_result: r.review_result as string | null,
            pgn: r.pgn as string | null,
          };
        });

        // Update state
        if (append) {
          setDeviations(prev => [...prev, ...mappedData]);
        } else {
          setDeviations(mappedData);
        }

        // Check if we have more results
        setHasMore((count || 0) > currentOffset + (data?.length || 0));
        setOffset(currentOffset + (data?.length || 0));
      } catch (err) {
        console.error('Error fetching deviations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch deviations'));
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, options.limit, options.timeControl, options.reviewed]
  );

  // Initial fetch
  useEffect(() => {
    fetchDeviations(0, false);
  }, [fetchDeviations]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchDeviations(offset, true);
    }
  }, [fetchDeviations, loading, hasMore, offset]);

  // Refetch function
  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchDeviations(0, false);
  }, [fetchDeviations]);

  return {
    deviations,
    loading,
    error,
    hasMore,
    refetch,
    loadMore,
  };
}

export function useDeviationById(id: string | undefined) {
  const [deviation, setDeviation] = useState<ApiDeviationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeviation = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase.from('opening_deviations').select('*').eq('id', id).single();
      if (supaError) throw supaError;
      setDeviation(data as ApiDeviationResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch deviation'));
      setDeviation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeviation();
  }, [fetchDeviation]);

  return { deviation, loading, error, refetch: fetchDeviation };
}
