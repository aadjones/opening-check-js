import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface ReviewScheduleEntry {
  date: string; // YYYY-MM-DD format
  count: number;
  workload: 'Normal' | 'Low' | 'High' | 'Extreme';
}

interface UseReviewScheduleResult {
  schedule: ReviewScheduleEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching the review schedule
 * Returns a breakdown of how many reviews are due on each day
 */
export function useReviewSchedule(): UseReviewScheduleResult {
  const { session } = useAuth();
  const [schedule, setSchedule] = useState<ReviewScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getWorkloadLevel = (count: number): 'Normal' | 'Low' | 'High' | 'Extreme' => {
    if (count === 0) return 'Low';
    if (count <= 10) return 'Normal';
    if (count <= 20) return 'High';
    return 'Extreme';
  };

  const fetchSchedule = useCallback(async () => {
    if (!session?.user?.id) {
      setSchedule([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get review queue entries for the next 7 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const { data: queueData, error: queueError } = await supabase
        .from('review_queue')
        .select('next_review_at')
        .eq('user_id', session.user.id)
        .lte('next_review_at', endDate.toISOString())
        .order('next_review_at', { ascending: true });

      if (queueError) throw queueError;

      // Group by date and count
      const dateMap = new Map<string, number>();
      
      // Initialize next 7 days with 0 counts
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        dateMap.set(dateKey, 0);
      }

      // Count reviews by date
      queueData?.forEach(item => {
        const reviewDate = new Date(item.next_review_at);
        const dateKey = reviewDate.toISOString().split('T')[0];
        const currentCount = dateMap.get(dateKey) || 0;
        dateMap.set(dateKey, currentCount + 1);
      });

      // Convert to schedule entries
      const scheduleEntries: ReviewScheduleEntry[] = Array.from(dateMap.entries())
        .map(([date, count]) => ({
          date,
          count,
          workload: getWorkloadLevel(count),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setSchedule(scheduleEntries);
    } catch (err) {
      console.error('Error fetching review schedule:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch review schedule'));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
} 