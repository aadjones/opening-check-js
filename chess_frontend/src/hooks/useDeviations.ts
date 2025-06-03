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

  const fetchDeviations = useCallback(async (currentOffset: number = 0, append: boolean = false) => {
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
        .from('deviations')
        .select('*', { count: 'exact' })
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(options.limit || 10)
        .range(currentOffset, currentOffset + (options.limit || 10) - 1);

      // Apply filters
      if (options.timeControl) {
        query = query.eq('time_control', options.timeControl);
      }
      if (options.reviewed !== undefined) {
        query = query.eq('reviewed', options.reviewed);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      // Update state
      if (append) {
        setDeviations(prev => [...prev, ...(data || [])]);
      } else {
        setDeviations(data || []);
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
  }, [session?.user?.id, options.limit, options.timeControl, options.reviewed]);

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