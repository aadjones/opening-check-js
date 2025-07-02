import { describe, it, expect } from 'vitest';
import { deriveOutcome } from '../utils/outcome';

describe('deriveOutcome', () => {
  it('handles white wins/loss/draw', () => {
    expect(deriveOutcome('1-0', 'white')).toBe('win');
    expect(deriveOutcome('0-1', 'white')).toBe('loss');
    expect(deriveOutcome('1/2-1/2', 'white')).toBe('draw');
  });

  it('handles black wins/loss/draw', () => {
    expect(deriveOutcome('0-1', 'black')).toBe('win');
    expect(deriveOutcome('1-0', 'black')).toBe('loss');
    expect(deriveOutcome('1/2-1/2', 'black')).toBe('draw');
  });

  it('returns null for missing data', () => {
    expect(deriveOutcome(undefined, 'white')).toBeNull();
    expect(deriveOutcome('1-0', undefined)).toBeNull();
  });
}); 