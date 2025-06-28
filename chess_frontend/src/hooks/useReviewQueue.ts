import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface PuzzleData {
  id: string;
  deviation_id: string;
  position_fen: string;
  expected_move: string;
  actual_move: string;
  move_number: number;
  color: string;
  opening_name: string | null;
  review_count: number;
  difficulty_level: number;
  previous_position_fen: string | null;
  pgn: string | null;
  // New spaced repetition fields
  ease_factor?: number;
  interval_days?: number;
  consecutive_successes?: number;
  total_reviews?: number;
  algorithm_type?: string;
}

interface UseReviewQueueResult {
  puzzles: PuzzleData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching puzzles from the review queue
 * Returns deviations that are due for review, ordered by priority
 */
export function useReviewQueue(): UseReviewQueueResult {
  const { session } = useAuth();
  const [puzzles, setPuzzles] = useState<PuzzleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPuzzles = useCallback(async () => {
    if (!session?.user?.id) {
      setPuzzles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get review queue entries with new schema fields
      const { data: queueData, error: queueError } = await supabase
        .from('review_queue')
        .select('id, deviation_id, review_count, difficulty_level, ease_factor, interval_days, consecutive_successes, total_reviews, algorithm_type')
        .eq('user_id', session.user.id)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true })
        .limit(20);

      if (queueError) throw queueError;

      if (!queueData || queueData.length === 0) {
        setPuzzles([]);
        return;
      }

      // Get corresponding deviation data (only user deviations)
      const deviationIds = queueData.map(item => item.deviation_id);
      const { data: deviationData, error: deviationError } = await supabase
        .from('opening_deviations')
        .select(
          'id, position_fen, expected_move, actual_move, move_number, color, opening_name, previous_position_fen, pgn'
        )
        .in('id', deviationIds)
        .eq('first_deviator', 'user');

      if (deviationError) throw deviationError;

      // Combine the data
      const transformedPuzzles: PuzzleData[] = queueData.map(queueItem => {
        const deviation = deviationData?.find(d => d.id === queueItem.deviation_id);
        if (!deviation) throw new Error(`Deviation not found for queue item ${queueItem.id}`);

        return {
          id: queueItem.id,
          deviation_id: queueItem.deviation_id,
          review_count: queueItem.review_count,
          difficulty_level: queueItem.difficulty_level,
          ease_factor: queueItem.ease_factor,
          interval_days: queueItem.interval_days,
          consecutive_successes: queueItem.consecutive_successes,
          total_reviews: queueItem.total_reviews,
          algorithm_type: queueItem.algorithm_type,
          position_fen: deviation.position_fen,
          expected_move: deviation.expected_move,
          actual_move: deviation.actual_move,
          move_number: deviation.move_number,
          color: deviation.color,
          opening_name: deviation.opening_name,
          previous_position_fen: deviation.previous_position_fen,
          pgn: deviation.pgn,
        };
      });

      setPuzzles(transformedPuzzles);
    } catch (err) {
      console.error('Error fetching puzzles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch puzzles'));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPuzzles();
  }, [fetchPuzzles]);

  return {
    puzzles,
    loading,
    error,
    refetch: fetchPuzzles,
  };
}
