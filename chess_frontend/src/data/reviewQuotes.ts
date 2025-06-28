/**
 * Motivational quotes for the spaced repetition review system
 * These appear randomly when puzzles are ready to review
 */

export const reviewQuotes = [
  'Burn your blunders into memory.',
  'Turn every misstep into muscle memory.',
  'Miss it once. Never again.',
  'Forge your openings in the fire of failure.',
  'Mistakes remembered. Lines mastered.',
  'Your worst moves—now your strongest recall.',
  'Every error is a lesson waiting to be learned.',
  'Transform your tactical blindness into perfect vision.',
  'Repetition turns weakness into strength.',
  'Master the moves that once mastered you.',
  'Your failures are your future victories.',
  'Polish your patterns through persistent practice.',
];

/**
 * Get a random motivational quote for the review session
 */
export function getRandomReviewQuote(): string {
  return reviewQuotes[Math.floor(Math.random() * reviewQuotes.length)];
}
