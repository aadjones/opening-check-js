import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { spacedRepetitionService, SpacedRepetitionConfig } from '../lib/spaced-repetition';

interface UseSpacedRepetitionResult {
  config: SpacedRepetitionConfig | null;
  stats: {
    totalAttempts: number;
    correctAttempts: number;
    accuracyRate: number;
    averageAttempts: number;
    reviewsToday: number;
  } | null;
  updateConfig: (config: Partial<SpacedRepetitionConfig>) => Promise<void>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing spaced repetition configuration and statistics
 */
export function useSpacedRepetition(): UseSpacedRepetitionResult {
  const { session } = useAuth();
  const [config, setConfig] = useState<SpacedRepetitionConfig | null>(null);
  const [stats, setStats] = useState<UseSpacedRepetitionResult['stats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) {
      setConfig(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Authenticate the service
      await spacedRepetitionService.authenticate(
        session.user.id,
        session.user.email || undefined,
        session.user.lichessUsername || undefined
      );

      // Fetch configuration and stats in parallel
      const [configData, statsData] = await Promise.all([
        spacedRepetitionService.getUserConfig(session.user.id),
        spacedRepetitionService.getReviewStats(session.user.id, 30), // Last 30 days
      ]);

      setConfig(configData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching spaced repetition data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch spaced repetition data'));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.email, session?.user?.lichessUsername]);

  const updateConfig = useCallback(
    async (newConfig: Partial<SpacedRepetitionConfig>) => {
      if (!session?.user?.id) {
        throw new Error('No user session found');
      }

      try {
        await spacedRepetitionService.authenticate(
          session.user.id,
          session.user.email || undefined,
          session.user.lichessUsername || undefined
        );

        await spacedRepetitionService.updateUserConfig(session.user.id, newConfig);

        // Refetch to get updated config
        await fetchData();
      } catch (err) {
        console.error('Error updating spaced repetition config:', err);
        throw err;
      }
    },
    [session?.user?.id, session?.user?.email, session?.user?.lichessUsername, fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    config,
    stats,
    updateConfig,
    loading,
    error,
    refetch: fetchData,
  };
}
