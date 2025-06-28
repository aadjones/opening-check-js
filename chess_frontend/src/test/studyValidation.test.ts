import { describe, it, expect } from 'vitest';
import { extractStudyId } from '../lib/lichess/studyValidation';

describe('studyValidation', () => {
  describe('extractStudyId', () => {
    it('extracts study ID from URLs', () => {
      // Valid URLs
      expect(extractStudyId('https://lichess.org/study/abc123')).toBe('abc123');
      expect(extractStudyId('/proxy/api/study/abc123')).toBe('abc123');
      expect(extractStudyId('https://lichess.org/study/abc123/chapter-xyz')).toBe('abc123');

      // Invalid URLs
      expect(extractStudyId('invalid-url')).toBeNull();
      expect(extractStudyId('https://lichess.org/game/abc123')).toBeNull();
      expect(extractStudyId('')).toBeNull();
    });
  });
});
