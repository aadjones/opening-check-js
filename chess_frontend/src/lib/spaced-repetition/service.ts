/**
 * Spaced Repetition Service
 * 
 * Handles all spaced repetition operations including:
 * - Recording puzzle attempts
 * - Updating review queues
 * - Managing algorithm configurations
 */

import { createClient } from '@supabase/supabase-js';
import { fetchSupabaseJWT } from '../auth/fetchSupabaseJWT';
import { calculateNextReview } from './algorithms';
import type { AlgorithmConfig } from './algorithms';

export interface PuzzleAttemptData {
  deviationId: string;
  userId: string;
  attemptNumber: number;
  wasCorrect: boolean;
  responseTimeMs?: number;
}

export interface ReviewQueueUpdate {
  id: string;
  nextReviewAt: string;
  easeFactor: number;
  intervalDays: number;
  consecutiveSuccesses: number;
  totalReviews: number;
  lastReviewedAt: string;
}

export interface SpacedRepetitionConfig {
  algorithmType: 'basic' | 'sm2plus' | 'fsrs';
  maxDailyReviews: number;
  targetRetentionRate: number;
  initialEaseFactor: number;
  easeAdjustmentFactor: number;
  minimumIntervalHours: number;
  maximumIntervalDays: number;
}

/**
 * Service class for managing spaced repetition operations
 */
export class SpacedRepetitionService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Set authentication token for the service
   */
  async authenticate(userId: string, email?: string, lichessUsername?: string) {
    const jwt = await fetchSupabaseJWT({
      sub: userId,
      email,
      lichess_username: lichessUsername,
    });

    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    );
  }

  /**
   * Record a puzzle attempt and update the review queue
   */
  async recordPuzzleAttempt(
    attemptData: PuzzleAttemptData,
    currentQueueEntry: any
  ): Promise<void> {
    try {
      // 1. Record the puzzle attempt
      const { error: attemptError } = await this.supabase
        .from('puzzle_attempts')
        .insert({
          user_id: attemptData.userId,
          deviation_id: attemptData.deviationId,
          attempt_number: attemptData.attemptNumber,
          was_correct: attemptData.wasCorrect,
          response_time_ms: attemptData.responseTimeMs,
        });

      if (attemptError) throw attemptError;

      // 2. Get user's algorithm configuration
      const config = await this.getUserConfig(attemptData.userId);

      // 3. Calculate next review using the appropriate algorithm
      const reviewResult = calculateNextReview(
        config.algorithmType,
        {
          wasCorrect: attemptData.wasCorrect,
          attempts: attemptData.attemptNumber,
          currentEaseFactor: currentQueueEntry.ease_factor || config.initialEaseFactor,
          currentIntervalDays: currentQueueEntry.interval_days || 1,
          consecutiveSuccesses: currentQueueEntry.consecutive_successes || 0,
          reviewCount: currentQueueEntry.review_count || 0,
          difficultyLevel: currentQueueEntry.difficulty_level || 1,
        },
        {
          targetRetentionRate: config.targetRetentionRate,
          initialEaseFactor: config.initialEaseFactor,
          easeAdjustmentFactor: config.easeAdjustmentFactor,
          minimumIntervalHours: config.minimumIntervalHours,
          maximumIntervalDays: config.maximumIntervalDays,
        } satisfies AlgorithmConfig
      );

      // 4. Update the review queue
      const { error: updateError } = await this.supabase
        .from('review_queue')
        .update({
          next_review_at: reviewResult.nextReviewAt.toISOString(),
          ease_factor: reviewResult.newEaseFactor,
          interval_days: reviewResult.newIntervalDays,
          consecutive_successes: reviewResult.consecutiveSuccesses,
          total_reviews: (currentQueueEntry.total_reviews || 0) + 1,
          last_reviewed_at: new Date().toISOString(),
          review_count: (currentQueueEntry.review_count || 0) + 1, // Keep for backward compatibility
        })
        .eq('id', currentQueueEntry.id);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error recording puzzle attempt:', error);
      throw error;
    }
  }

  /**
   * Get user's spaced repetition configuration
   */
  async getUserConfig(userId: string): Promise<SpacedRepetitionConfig> {
    try {
      const { data, error } = await this.supabase
        .from('spaced_repetition_config')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return data if found, otherwise return defaults
      if (data) {
        return {
          algorithmType: data.algorithm_type,
          maxDailyReviews: data.max_daily_reviews,
          targetRetentionRate: data.target_retention_rate,
          initialEaseFactor: data.initial_ease_factor,
          easeAdjustmentFactor: data.ease_adjustment_factor,
          minimumIntervalHours: data.minimum_interval_hours,
          maximumIntervalDays: data.maximum_interval_days,
        };
      }

      // Create default config for user
      const defaultConfig: SpacedRepetitionConfig = {
        algorithmType: 'sm2plus',
        maxDailyReviews: 20,
        targetRetentionRate: 0.9,
        initialEaseFactor: 2.5,
        easeAdjustmentFactor: 0.15,
        minimumIntervalHours: 1.0,
        maximumIntervalDays: 365.0,
      };

      await this.createUserConfig(userId, defaultConfig);
      return defaultConfig;

    } catch (error) {
      console.error('Error getting user config:', error);
      // Return defaults on error
      return {
        algorithmType: 'sm2plus',
        maxDailyReviews: 20,
        targetRetentionRate: 0.9,
        initialEaseFactor: 2.5,
        easeAdjustmentFactor: 0.15,
        minimumIntervalHours: 1.0,
        maximumIntervalDays: 365.0,
      };
    }
  }

  /**
   * Create or update user's spaced repetition configuration
   */
  async updateUserConfig(userId: string, config: Partial<SpacedRepetitionConfig>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('spaced_repetition_config')
        .upsert({
          user_id: userId,
          algorithm_type: config.algorithmType,
          max_daily_reviews: config.maxDailyReviews,
          target_retention_rate: config.targetRetentionRate,
          initial_ease_factor: config.initialEaseFactor,
          ease_adjustment_factor: config.easeAdjustmentFactor,
          minimum_interval_hours: config.minimumIntervalHours,
          maximum_interval_days: config.maximumIntervalDays,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user config:', error);
      throw error;
    }
  }

  /**
   * Create default configuration for a user
   */
  private async createUserConfig(userId: string, config: SpacedRepetitionConfig): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('spaced_repetition_config')
        .insert({
          user_id: userId,
          algorithm_type: config.algorithmType,
          max_daily_reviews: config.maxDailyReviews,
          target_retention_rate: config.targetRetentionRate,
          initial_ease_factor: config.initialEaseFactor,
          ease_adjustment_factor: config.easeAdjustmentFactor,
          minimum_interval_hours: config.minimumIntervalHours,
          maximum_interval_days: config.maximumIntervalDays,
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error;
      }
    } catch (error) {
      console.error('Error creating user config:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get user's review statistics
   */
  async getReviewStats(userId: string, days: number = 30): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    accuracyRate: number;
    averageAttempts: number;
    reviewsToday: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: attempts, error } = await this.supabase
        .from('puzzle_attempts')
        .select('was_correct, attempt_number, created_at')
        .eq('user_id', userId)
        .gte('created_at', cutoffDate.toISOString());

      if (error) throw error;

      const totalAttempts = attempts?.length || 0;
      const correctAttempts = attempts?.filter(a => a.was_correct).length || 0;
      const accuracyRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
      
      const attemptNumbers = attempts?.map(a => a.attempt_number) || [];
      const averageAttempts = attemptNumbers.length > 0 
        ? attemptNumbers.reduce((sum, num) => sum + num, 0) / attemptNumbers.length 
        : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reviewsToday = attempts?.filter(a => 
        new Date(a.created_at) >= today
      ).length || 0;

      return {
        totalAttempts,
        correctAttempts,
        accuracyRate,
        averageAttempts,
        reviewsToday,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracyRate: 0,
        averageAttempts: 0,
        reviewsToday: 0,
      };
    }
  }
}

// Export singleton instance
export const spacedRepetitionService = new SpacedRepetitionService(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);