import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { Database } from '../types/supabase';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

interface UseDeviationsOptions {
  limit?: number;
  offset?: number;
  timeControl?: 'bullet' | 'blitz' | 'rapid' | 'classical';
  reviewed?: boolean;
  reviewStatus?: string;
}

interface UseDeviationsResult {
  deviations: Deviation[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Hook for fetching and managing user deviations
 * Now uses the backend /api/deviations endpoint.
 * TODO: Remove user_id param when backend auth is ready.
 */
export function useDeviations(options: UseDeviationsOptions = {}): UseDeviationsResult {
  const { session } = useAuth();
  const [deviations, setDeviations] = useState<Deviation[]>([]);
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

        // Build query params
        const params = new URLSearchParams({
          user_id: session.user.id, // TODO: Remove when backend uses auth context
          limit: String(options.limit || 10),
          offset: String(currentOffset),
        });
        // (Optional) Add filters here if supported by backend
        if (options.reviewStatus) {
          params.append('review_status', options.reviewStatus);
        }

        const res = await fetch(`/api/deviations?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed to fetch deviations: ${res.status}`);
        const data: Deviation[] = await res.json();

        if (append) {
          setDeviations(prev => [...prev, ...data]);
        } else {
          setDeviations(data);
        }
        setHasMore(data.length === (options.limit || 10));
        setOffset(currentOffset + data.length);
      } catch (err) {
        console.error('Error fetching deviations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch deviations'));
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, options.limit, options.reviewStatus]
  );

  // Initial fetch
  useEffect(() => {
    fetchDeviations(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, options.limit]);

  // Load more function
  const loadMore = useCallback(() => fetchDeviations(offset, true), [fetchDeviations, offset]);

  // Refetch function
  const refetch = useCallback(() => fetchDeviations(0, false), [fetchDeviations]);

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
  const [deviation, setDeviation] = useState<Deviation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeviation = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deviations/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setDeviation(null);
        }
        throw new Error(`Failed to fetch deviation: ${res.status}`);
      }
      const data: Deviation = await res.json();
      setDeviation(data);
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
