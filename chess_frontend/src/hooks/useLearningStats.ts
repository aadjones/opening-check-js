import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface LearningStats {
  learningCount: number;
  matureCount: number;
  totalCount: number;
}

interface UseLearningStatsResult {
  stats: LearningStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching learning statistics from the review queue
 * Learning: items with consecutive_successes < 3 or null
 * Mature: items with consecutive_successes >= 3
 */
export function useLearningStats(): UseLearningStatsResult {
  const { session } = useAuth();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query the review queue for learning statistics
      const { data, error: queryError } = await supabase
        .from('review_queue')
        .select('consecutive_successes')
        .eq('user_id', session.user.id);

      if (queryError) throw queryError;

      if (!data) {
        setStats({ learningCount: 0, matureCount: 0, totalCount: 0 });
        return;
      }

      // Count learning vs mature items
      const totalCount = data.length;
      const learningCount = data.filter(
        item => item.consecutive_successes === null || item.consecutive_successes < 3
      ).length;
      const matureCount = data.filter(
        item => item.consecutive_successes !== null && item.consecutive_successes >= 3
      ).length;

      setStats({
        learningCount,
        matureCount,
        totalCount,
      });
    } catch (err) {
      console.error('Error fetching learning stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch learning stats'));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
