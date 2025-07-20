/**
 * Spaced Repetition Algorithms
 *
 * Implements multiple spaced repetition algorithms including:
 * - SM2+ (Enhanced SuperMemo 2)
 * - Basic algorithm (current implementation)
 * - FSRS (Future implementation)
 */

export interface ReviewResult {
  nextReviewAt: Date;
  newEaseFactor: number;
  newIntervalDays: number;
  consecutiveSuccesses: number;
}

export interface ReviewInput {
  wasCorrect: boolean;
  attempts: number;
  currentEaseFactor: number;
  currentIntervalDays: number;
  consecutiveSuccesses: number;
  reviewCount: number;
  difficultyLevel: number;
}

export interface AlgorithmConfig {
  targetRetentionRate: number;
  initialEaseFactor: number;
  easeAdjustmentFactor: number;
  minimumIntervalHours: number;
  maximumIntervalDays: number;
}

const DEFAULT_CONFIG: AlgorithmConfig = {
  targetRetentionRate: 0.9,
  initialEaseFactor: 2.5,
  easeAdjustmentFactor: 0.15,
  minimumIntervalHours: 1.0,
  maximumIntervalDays: 365.0,
};

/**
 * SM2+ Algorithm (Enhanced SuperMemo 2)
 *
 * Improvements over basic SM2:
 * - Better handling of multiple attempts
 * - Graduated intervals for failed items
 * - Chess-specific optimizations
 * - Difficulty-based adjustments
 */
export function calculateSM2Plus(input: ReviewInput, config: AlgorithmConfig = DEFAULT_CONFIG): ReviewResult {
  const { wasCorrect, attempts, currentEaseFactor, currentIntervalDays, consecutiveSuccesses, difficultyLevel } = input;

  let newEaseFactor = currentEaseFactor;
  let newIntervalDays = currentIntervalDays;
  let newConsecutiveSuccesses = consecutiveSuccesses;

  if (wasCorrect) {
    // Successful review
    newConsecutiveSuccesses = consecutiveSuccesses + 1;

    // Adjust ease factor based on performance
    if (attempts === 1) {
      // Perfect first attempt - increase ease factor slightly
      newEaseFactor = Math.min(2.5, currentEaseFactor + 0.1);
    } else if (attempts === 2) {
      // Correct on second attempt - small increase
      newEaseFactor = Math.min(2.5, currentEaseFactor + 0.05);
    }
    // No ease factor increase for 3+ attempts, but keep current ease

    // Calculate new interval using SM2+ formula
    if (newConsecutiveSuccesses === 1) {
      newIntervalDays = 1; // First successful review
    } else if (newConsecutiveSuccesses === 2) {
      newIntervalDays = 6; // Second successful review
    } else {
      // Subsequent reviews: interval = previous_interval * ease_factor
      newIntervalDays = currentIntervalDays * newEaseFactor;
    }

    // Apply difficulty adjustment (harder puzzles get longer intervals)
    const difficultyMultiplier = 1.0 + (difficultyLevel - 1) * 0.2;
    newIntervalDays *= difficultyMultiplier;
  } else {
    // Failed review
    newConsecutiveSuccesses = 0;

    // Reduce ease factor based on number of attempts
    const easeReduction = config.easeAdjustmentFactor * attempts;
    newEaseFactor = Math.max(1.3, currentEaseFactor - easeReduction);

    // Graduated failure intervals - more forgiving than basic algorithm
    if (consecutiveSuccesses === 0) {
      // Already failed recently - short interval
      newIntervalDays = config.minimumIntervalHours / 24; // 1 hour default
    } else if (consecutiveSuccesses === 1) {
      // First failure after some success - give another chance soon
      newIntervalDays = 4 / 24; // 4 hours
    } else {
      // Failed after multiple successes - medium interval
      newIntervalDays = 1; // 1 day
    }
  }

  // Apply constraints
  newIntervalDays = Math.max(config.minimumIntervalHours / 24, Math.min(config.maximumIntervalDays, newIntervalDays));

  // Calculate next review date
  const nextReviewAt = new Date(Date.now() + newIntervalDays * 24 * 60 * 60 * 1000);

  return {
    nextReviewAt,
    newEaseFactor,
    newIntervalDays,
    consecutiveSuccesses: newConsecutiveSuccesses,
  };
}

/**
 * Basic Algorithm (current implementation, enhanced)
 *
 * Improved version of the current simple algorithm
 */
export function calculateBasic(input: ReviewInput, config: AlgorithmConfig = DEFAULT_CONFIG): ReviewResult {
  const { wasCorrect, attempts, reviewCount, difficultyLevel } = input;

  let newIntervalDays: number;
  let newConsecutiveSuccesses = input.consecutiveSuccesses;

  if (wasCorrect) {
    newConsecutiveSuccesses = input.consecutiveSuccesses + 1;

    // Enhanced basic algorithm with better progression
    const baseInterval = Math.min(1 + reviewCount * 2, 30);

    // Adjust for performance
    const performanceMultiplier = attempts === 1 ? 1.2 : attempts === 2 ? 1.0 : 0.8;

    // Adjust for difficulty
    const difficultyMultiplier = 1.0 + (difficultyLevel - 1) * 0.3;

    newIntervalDays = baseInterval * performanceMultiplier * difficultyMultiplier;
  } else {
    newConsecutiveSuccesses = 0;

    // Graduated failure recovery
    if (input.consecutiveSuccesses === 0) {
      newIntervalDays = config.minimumIntervalHours / 24; // 1 hour
    } else if (input.consecutiveSuccesses <= 2) {
      newIntervalDays = 4 / 24; // 4 hours
    } else {
      newIntervalDays = 1; // 1 day
    }
  }

  // Apply constraints
  newIntervalDays = Math.max(config.minimumIntervalHours / 24, Math.min(config.maximumIntervalDays, newIntervalDays));

  const nextReviewAt = new Date(Date.now() + newIntervalDays * 24 * 60 * 60 * 1000);

  return {
    nextReviewAt,
    newEaseFactor: input.currentEaseFactor, // Basic algorithm doesn't use ease factor
    newIntervalDays,
    consecutiveSuccesses: newConsecutiveSuccesses,
  };
}

/**
 * Algorithm dispatcher - chooses the appropriate algorithm
 */
export function calculateNextReview(
  algorithmType: 'basic' | 'sm2plus' | 'fsrs',
  input: ReviewInput,
  config?: AlgorithmConfig
): ReviewResult {
  switch (algorithmType) {
    case 'sm2plus':
      return calculateSM2Plus(input, config);
    case 'basic':
      return calculateBasic(input, config);
    case 'fsrs':
      // TODO: Implement FSRS algorithm
      console.warn('FSRS algorithm not yet implemented, falling back to SM2+');
      return calculateSM2Plus(input, config);
    default:
      throw new Error(`Unknown algorithm type: ${algorithmType}`);
  }
}

/**
 * Initialize review queue entry for a new deviation
 */
export function initializeReviewEntry(
  algorithmType: 'basic' | 'sm2plus' | 'fsrs' = 'sm2plus',
  config: AlgorithmConfig = DEFAULT_CONFIG
): Partial<ReviewResult> {
  const now = new Date();

  if (algorithmType === 'sm2plus') {
    return {
      nextReviewAt: now, // Available immediately for first review
      newEaseFactor: config.initialEaseFactor,
      newIntervalDays: 0, // Will be set after first review
      consecutiveSuccesses: 0,
    };
  } else {
    return {
      nextReviewAt: now,
      newEaseFactor: 2.5, // Default for basic algorithm
      newIntervalDays: 0,
      consecutiveSuccesses: 0,
    };
  }
}
