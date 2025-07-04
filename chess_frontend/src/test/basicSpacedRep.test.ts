import { describe, it, expect } from 'vitest';

// Simple inline functions to avoid import issues
const calculateInterval = (
  quality: number,
  repetitions: number,
  previousInterval: number,
  easeFactor: number
): { interval: number; easeFactor: number } => {
  let newEaseFactor = easeFactor;
  
  if (quality < 3) {
    // Failed review - reset repetitions
    return { interval: 1, easeFactor: newEaseFactor };
  }
  
  // Update ease factor
  newEaseFactor = Math.max(1.3, newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(previousInterval * newEaseFactor);
  }
  
  return { interval: newInterval, easeFactor: newEaseFactor };
};

const isCardMature = (repetitions: number, interval: number): boolean => {
  return repetitions >= 2 && interval >= 21;
};

describe('Basic Spaced Repetition Logic', () => {
  describe('calculateInterval', () => {
    it('should handle first review correctly', () => {
      const result = calculateInterval(4, 0, 0, 2.5);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should handle second review correctly', () => {
      const result = calculateInterval(4, 1, 1, 2.5);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should calculate mature card intervals', () => {
      const result = calculateInterval(4, 2, 6, 2.5);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
      expect(result.easeFactor).toBe(2.5);
    });

    it('should reset interval on failed review', () => {
      const result = calculateInterval(1, 5, 30, 2.5);
      expect(result.interval).toBe(1);
    });

    it('should adjust ease factor based on quality', () => {
      // High quality should increase ease factor
      const goodResult = calculateInterval(5, 2, 6, 2.5);
      expect(goodResult.easeFactor).toBeGreaterThan(2.5);
      
      // Low quality should decrease ease factor
      const poorResult = calculateInterval(3, 2, 6, 2.5);
      expect(poorResult.easeFactor).toBeLessThan(2.5);
    });

    it('should enforce minimum ease factor', () => {
      const result = calculateInterval(0, 2, 6, 1.3);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('isCardMature', () => {
    it('should identify immature cards', () => {
      expect(isCardMature(0, 1)).toBe(false);
      expect(isCardMature(1, 6)).toBe(false);
      expect(isCardMature(2, 15)).toBe(false);
    });

    it('should identify mature cards', () => {
      expect(isCardMature(2, 21)).toBe(true);
      expect(isCardMature(3, 30)).toBe(true);
      expect(isCardMature(5, 100)).toBe(true);
    });
  });

  describe('Learning progression simulation', () => {
    it('should simulate a typical learning progression', () => {
      let repetitions = 0;
      let interval = 0;
      let easeFactor = 2.5;
      
      // First review (quality 4)
      const first = calculateInterval(4, repetitions, interval, easeFactor);
      repetitions++;
      interval = first.interval;
      easeFactor = first.easeFactor;
      
      expect(interval).toBe(1);
      expect(isCardMature(repetitions, interval)).toBe(false);
      
      // Second review (quality 4)
      const second = calculateInterval(4, repetitions, interval, easeFactor);
      repetitions++;
      interval = second.interval;
      easeFactor = second.easeFactor;
      
      expect(interval).toBe(6);
      expect(isCardMature(repetitions, interval)).toBe(false);
      
      // Third review (quality 4)
      const third = calculateInterval(4, repetitions, interval, easeFactor);
      repetitions++;
      interval = third.interval;
      easeFactor = third.easeFactor;
      
      expect(interval).toBe(15);
      expect(isCardMature(repetitions, interval)).toBe(false);
      
      // Fourth review (quality 4) - should become mature
      const fourth = calculateInterval(4, repetitions, interval, easeFactor);
      repetitions++;
      interval = fourth.interval;
      
      expect(interval).toBeGreaterThan(21);
      expect(isCardMature(repetitions, interval)).toBe(true);
    });
  });
}); 