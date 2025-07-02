export type Outcome = 'win' | 'loss' | 'draw' | null;

/**
 * Derive the outcome from the PGN result string ("1-0", "0-1", "1/2-1/2") and the user's color.
 * Returns `null` when the result is malformed or userColor is unknown.
 */
export function deriveOutcome(
  result: string | undefined,
  userColor: 'white' | 'black' | null | undefined,
): Outcome {
  if (!result || !userColor) return null;
  if (result === '1/2-1/2') return 'draw';

  const cleaned = result.trim();
  if (userColor === 'white') {
    if (cleaned === '1-0') return 'win';
    if (cleaned === '0-1') return 'loss';
  } else if (userColor === 'black') {
    if (cleaned === '0-1') return 'win';
    if (cleaned === '1-0') return 'loss';
  }
  return null;
} 