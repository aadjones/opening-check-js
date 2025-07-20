/**
 * Spaced Repetition Module
 *
 * Export all spaced repetition functionality
 */

export * from './algorithms';
export * from './service';

// Re-export common types and functions for convenience
export type { ReviewResult, ReviewInput, AlgorithmConfig } from './algorithms';

export type { PuzzleAttemptData, ReviewQueueUpdate, SpacedRepetitionConfig } from './service';

export { calculateSM2Plus, calculateBasic, calculateNextReview, initializeReviewEntry } from './algorithms';

export { SpacedRepetitionService, spacedRepetitionService } from './service';
