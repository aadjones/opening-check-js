import { describe, it, expect, beforeEach } from 'vitest';
import { calculateSM2Plus, calculateBasic, type ReviewInput, type AlgorithmConfig } from '../lib/spaced-repetition/algorithms';

describe('Spaced Repetition Algorithms', () => {
  let mockReviewInput: ReviewInput;
  let defaultConfig: AlgorithmConfig;

  beforeEach(() => {
    // Mock a typical review input
    mockReviewInput = {
      wasCorrect: true,
      attempts: 1,
      currentEaseFactor: 2.5,
      currentIntervalDays: 1,
      consecutiveSuccesses: 0,
      reviewCount: 0,
      difficultyLevel: 2, // normal difficulty
    };

    // Default configuration
    defaultConfig = {
      targetRetentionRate: 0.9,
      initialEaseFactor: 2.5,
      easeAdjustmentFactor: 0.15,
      minimumIntervalHours: 1,
      maximumIntervalDays: 365,
    };
  });

  describe('SM2+ Algorithm', () => {
    it('should handle first correct answer', () => {
      const result = calculateSM2Plus(mockReviewInput, defaultConfig);
      
      expect(result.consecutiveSuccesses).toBe(1);
      expect(result.newIntervalDays).toBeCloseTo(1.2, 1); // 1 day * difficulty multiplier (1.2 for normal)
      expect(result.newEaseFactor).toBeGreaterThanOrEqual(2.5); // Should increase slightly for perfect attempt
      expect(result.nextReviewAt).toBeInstanceOf(Date);
    });

    it('should handle first incorrect answer', () => {
      const incorrectInput = { ...mockReviewInput, wasCorrect: false };
      const result = calculateSM2Plus(incorrectInput, defaultConfig);
      
      expect(result.consecutiveSuccesses).toBe(0);
      expect(result.newIntervalDays).toBe(defaultConfig.minimumIntervalHours / 24); // Reset to minimum
      expect(result.newEaseFactor).toBeLessThan(2.5); // Should decrease
      expect(result.nextReviewAt).toBeInstanceOf(Date);
    });

    describe('Graduated Reviews (Mature Phase)', () => {
      it('should increase interval for correct answers', () => {
        const matureInput = { 
          ...mockReviewInput, 
          consecutiveSuccesses: 3,
          currentIntervalDays: 7,
          currentEaseFactor: 2.5
        };
        const result = calculateSM2Plus(matureInput, defaultConfig);
        
        expect(result.consecutiveSuccesses).toBe(4);
        expect(result.newIntervalDays).toBeGreaterThan(7);
        expect(result.newEaseFactor).toBeGreaterThanOrEqual(2.5);
      });

      it('should reset interval for incorrect answers', () => {
        const matureInput = { 
          ...mockReviewInput, 
          wasCorrect: false,
          consecutiveSuccesses: 3,
          currentIntervalDays: 7,
          currentEaseFactor: 2.5
        };
        const result = calculateSM2Plus(matureInput, defaultConfig);
        
        expect(result.consecutiveSuccesses).toBe(0);
        expect(result.newIntervalDays).toBe(1); // Reset to 1 day for failed mature card
        expect(result.newEaseFactor).toBeLessThan(2.5);
      });

      it('should respect maximum interval', () => {
        const highIntervalInput = { 
          ...mockReviewInput, 
          currentIntervalDays: 334, // ~11 months
          currentEaseFactor: 2.5
        };
        const result = calculateSM2Plus(highIntervalInput, defaultConfig);
        
        expect(result.newIntervalDays).toBeLessThanOrEqual(defaultConfig.maximumIntervalDays);
      });
    });

    describe('Ease Factor Management', () => {
      it('should increase ease factor for perfect answers when below max', () => {
        const perfectInput = { 
          ...mockReviewInput, 
          attempts: 1,
          currentEaseFactor: 2.4 // Start below max so it can increase
        };
        const result = calculateSM2Plus(perfectInput, defaultConfig);
        
        // Perfect first attempt should increase ease factor slightly
        expect(result.newEaseFactor).toBe(2.5); // 2.4 + 0.1 = 2.5 (capped)
      });

      it('should decrease ease factor for wrong answers', () => {
        const wrongInput = { ...mockReviewInput, wasCorrect: false };
        const result = calculateSM2Plus(wrongInput, defaultConfig);
        
        expect(result.newEaseFactor).toBeLessThan(2.5);
      });

      it('should respect minimum ease factor', () => {
        const lowEaseInput = { 
          ...mockReviewInput, 
          wasCorrect: false,
          currentEaseFactor: 1.3,
          attempts: 3
        };
        const result = calculateSM2Plus(lowEaseInput, defaultConfig);
        
        expect(result.newEaseFactor).toBeGreaterThanOrEqual(1.3);
      });

      it('should handle multiple attempts appropriately', () => {
        const multipleAttemptsInput = { 
          ...mockReviewInput, 
          attempts: 2,
          currentEaseFactor: 2.4 // Start below max
        };
        const result = calculateSM2Plus(multipleAttemptsInput, defaultConfig);
        
        // Second attempt should have smaller ease factor increase
        expect(result.newEaseFactor).toBeCloseTo(2.45, 2); // 2.4 + 0.05, with floating point tolerance
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero interval gracefully', () => {
        const zeroIntervalInput = { ...mockReviewInput, currentIntervalDays: 0 };
        const result = calculateSM2Plus(zeroIntervalInput, defaultConfig);
        
        expect(result.newIntervalDays).toBeGreaterThan(0);
      });

      it('should handle negative ease factor', () => {
        const negativeEaseInput = { 
          ...mockReviewInput, 
          wasCorrect: false, // Must be wrong answer for ease factor adjustment logic to run
          currentEaseFactor: -1 
        };
        const result = calculateSM2Plus(negativeEaseInput, defaultConfig);
        
        expect(result.newEaseFactor).toBeGreaterThanOrEqual(1.3);
      });

      it('should handle very high consecutive successes', () => {
        const highSuccessInput = { 
          ...mockReviewInput, 
          consecutiveSuccesses: 100,
          currentIntervalDays: 334 
        };
        const result = calculateSM2Plus(highSuccessInput, defaultConfig);
        
        expect(result.consecutiveSuccesses).toBe(101);
        expect(result.newIntervalDays).toBeLessThanOrEqual(defaultConfig.maximumIntervalDays);
      });
    });
  });

  describe('Basic Algorithm', () => {
    it('should use enhanced basic algorithm for correct answers', () => {
      const result = calculateBasic(mockReviewInput, defaultConfig);
      
      expect(result.consecutiveSuccesses).toBe(1);
      expect(result.newIntervalDays).toBeGreaterThan(mockReviewInput.currentIntervalDays);
    });

    it('should reset to minimum for incorrect answers', () => {
      const wrongInput = { 
        ...mockReviewInput, 
        wasCorrect: false,
        currentIntervalDays: 7
      };
      const result = calculateBasic(wrongInput, defaultConfig);
      
      expect(result.consecutiveSuccesses).toBe(0);
      expect(result.newIntervalDays).toBe(defaultConfig.minimumIntervalHours / 24);
    });

    it('should respect maximum interval', () => {
      const highIntervalInput = { 
        ...mockReviewInput, 
        currentIntervalDays: 300,
        reviewCount: 50
      };
      const result = calculateBasic(highIntervalInput, defaultConfig);
      
      expect(result.newIntervalDays).toBeLessThanOrEqual(defaultConfig.maximumIntervalDays);
    });
  });

  describe('Algorithm Comparison', () => {
    it('should produce different results for same input', () => {
      const matureInput = { 
        ...mockReviewInput, 
        consecutiveSuccesses: 5,
        currentIntervalDays: 7,
        reviewCount: 5
      };
      
      const sm2Result = calculateSM2Plus(matureInput, defaultConfig);
      const basicResult = calculateBasic(matureInput, defaultConfig);
      
      // Results should be different (SM2+ uses ease factor, Basic uses different logic)
      expect(sm2Result.newIntervalDays).not.toBe(basicResult.newIntervalDays);
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        ...defaultConfig,
        minimumIntervalHours: -1,
        maximumIntervalDays: 0.5, // Set to small positive to test constraint logic
      };
      
      // Should not throw error and apply constraints
      expect(() => {
        calculateSM2Plus(mockReviewInput, invalidConfig);
      }).not.toThrow();
      
      const result = calculateSM2Plus(mockReviewInput, invalidConfig);
      // With negative minimum and small max, should be constrained to small positive value
      expect(result.newIntervalDays).toBeGreaterThan(0);
      expect(result.newIntervalDays).toBeLessThanOrEqual(0.5);
    });
  });
}); 