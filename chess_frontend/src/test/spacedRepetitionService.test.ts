import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { SpacedRepetitionService, type PuzzleAttemptData, type SpacedRepetitionConfig } from '../lib/spaced-repetition/service';

// Mock fetchSupabaseJWT first
vi.mock('../lib/auth/fetchSupabaseJWT', () => ({
  fetchSupabaseJWT: vi.fn(() => Promise.resolve('mock-jwt-token'))
}));

// Mock Supabase client creation with a factory function to avoid hoisting issues
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}));

// Get the mocked createClient function
import { createClient } from '@supabase/supabase-js';
const mockCreateClient = vi.mocked(createClient);

describe('SpacedRepetitionService', () => {
  let service: SpacedRepetitionService;
  let mockPuzzleAttempt: PuzzleAttemptData;
  let mockQueueEntry: any; // Using any since we don't have the exact type
  let mockConfig: SpacedRepetitionConfig;
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a fresh mock client for each test
    mockSupabaseClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    };
    
    // Make createClient return our mock
    mockCreateClient.mockReturnValue(mockSupabaseClient);
    
    service = new SpacedRepetitionService('test-url', 'test-key');
    
    mockPuzzleAttempt = {
      deviationId: 'dev-123',
      userId: 'user-456',
      attemptNumber: 1,
      wasCorrect: true
    };

    mockQueueEntry = {
      id: 'queue-789',
      user_id: 'user-456',
      deviation_id: 'dev-123',
      algorithm: 'sm2_plus',
      interval_hours: 24,
      ease_factor: 2.5,
      consecutive_successes: 0,
      total_reviews: 0,
      last_reviewed: null,
      next_review: new Date(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      difficulty_rating: 'normal',
      review_history: []
    };

    mockConfig = {
      algorithmType: 'sm2plus',
      maxDailyReviews: 20,
      targetRetentionRate: 0.9,
      initialEaseFactor: 2.5,
      easeAdjustmentFactor: 0.15,
      minimumIntervalHours: 1,
      maximumIntervalDays: 365
    };
  });

  describe('Authentication', () => {
    it('should authenticate successfully', async () => {
      await expect(
        service.authenticate('user-123', 'test@example.com', 'lichess-user')
      ).resolves.not.toThrow();
    });

    it('should throw error when not authenticated', async () => {
      await expect(
        service.recordPuzzleAttempt(mockPuzzleAttempt, mockQueueEntry)
      ).rejects.toThrow('Service not authenticated');
    });
  });

  describe('Puzzle Attempt Recording', () => {
    beforeEach(async () => {
      await service.authenticate('user-456', 'test@example.com', 'lichess-user');
    });

    it('should record successful puzzle attempt', async () => {
      // Mock successful database responses
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { ...mockQueueEntry, consecutive_successes: 1 },
        error: null
      });
      
      mockSupabaseClient.from().update().eq().select().single = mockUpdate;

      await service.recordPuzzleAttempt(mockPuzzleAttempt, mockQueueEntry);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('review_queue');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should record failed puzzle attempt', async () => {
      const failedAttempt = { ...mockPuzzleAttempt, wasCorrect: false };
      
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { ...mockQueueEntry, consecutive_successes: 0 },
        error: null
      });
      
      mockSupabaseClient.from().update().eq().select().single = mockUpdate;

      await service.recordPuzzleAttempt(failedAttempt, mockQueueEntry);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('review_queue');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      mockSupabaseClient.from().update().eq().select().single = mockUpdate;

      await expect(
        service.recordPuzzleAttempt(mockPuzzleAttempt, mockQueueEntry)
      ).rejects.toThrow('Database error');
    });

    it('should validate puzzle attempt data', async () => {
      const invalidAttempt = { ...mockPuzzleAttempt, deviationId: '' };

      await expect(
        service.recordPuzzleAttempt(invalidAttempt, mockQueueEntry)
      ).rejects.toThrow();
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      await service.authenticate('user-456', 'test@example.com', 'lichess-user');
    });

    it('should get user configuration', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: mockConfig,
        error: null
      });
      
      mockSupabaseClient.from().select().eq().single = mockSelect;

      const config = await service.getUserConfig('user-456');

      expect(config).toEqual(mockConfig);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('spaced_repetition_config');
    });

    it('should return default config when user config not found', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // Not found error
      });
      
      mockSupabaseClient.from().select().eq().single = mockSelect;

      const config = await service.getUserConfig('user-456');

      // Should return default configuration
      expect(config.algorithmType).toBe('sm2plus');
      expect(config.initialEaseFactor).toBe(2.5);
    });

    it('should update user configuration', async () => {
      const newConfig = { ...mockConfig, initialEaseFactor: 2.0 };
      
      const mockUpsert = vi.fn().mockResolvedValue({
        data: newConfig,
        error: null
      });
      
      mockSupabaseClient.from().upsert().select().single = mockUpsert;

      await service.updateUserConfig('user-456', newConfig);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('spaced_repetition_config');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should validate configuration before saving', async () => {
      const invalidConfig = {
        ...mockConfig,
        minimumIntervalHours: -1,
        maximumIntervalDays: 0
      };

      await expect(
        service.updateUserConfig('user-456', invalidConfig)
      ).rejects.toThrow();
    });
  });

  describe('Review Statistics', () => {
    beforeEach(async () => {
      await service.authenticate('user-456', 'test@example.com', 'lichess-user');
    });

    it('should get review statistics', async () => {
      const mockStats = {
        totalAttempts: 10,
        correctAttempts: 8,
        accuracyRate: 0.8,
        averageAttempts: 1.2,
        reviewsToday: 3
      };

      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockStats],
        error: null
      });
      
      mockSupabaseClient.from().select().eq = vi.fn().mockReturnValue({
        single: mockSelect
      });

      const stats = await service.getReviewStats('user-456');

      expect(stats).toEqual(mockStats);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('puzzle_attempts');
    });

    it('should handle empty statistics', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });
      
      mockSupabaseClient.from().select().eq = vi.fn().mockReturnValue({
        single: mockSelect
      });

      const stats = await service.getReviewStats('user-456');

      // Should return default stats
      expect(stats.totalAttempts).toBe(0);
      expect(stats.correctAttempts).toBe(0);
      expect(stats.accuracyRate).toBe(0);
    });
  });

  describe('Algorithm Selection', () => {
    it('should use SM2+ algorithm by default', () => {
      const algorithm = (service as any).getAlgorithm('sm2_plus');
      expect(algorithm.constructor.name).toBe('SM2PlusAlgorithm');
    });

    it('should use Basic algorithm when specified', () => {
      const algorithm = (service as any).getAlgorithm('basic');
      expect(algorithm.constructor.name).toBe('BasicAlgorithm');
    });

    it('should fallback to SM2+ for unknown algorithms', () => {
      const algorithm = (service as any).getAlgorithm('unknown');
      expect(algorithm.constructor.name).toBe('SM2PlusAlgorithm');
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      await service.authenticate('user-456', 'test@example.com', 'lichess-user');
    });

    it('should validate puzzle attempt has required fields', async () => {
      const invalidAttempts = [
        { ...mockPuzzleAttempt, deviationId: '' },
        { ...mockPuzzleAttempt, userId: '' },
        { ...mockPuzzleAttempt, attemptNumber: 0 },
        { ...mockPuzzleAttempt, wasCorrect: undefined as any }
      ];

      for (const attempt of invalidAttempts) {
        await expect(
          service.recordPuzzleAttempt(attempt, mockQueueEntry)
        ).rejects.toThrow();
      }
    });

    it('should validate queue entry has required fields', async () => {
      const invalidQueueEntry = { ...mockQueueEntry, id: '' };

      await expect(
        service.recordPuzzleAttempt(mockPuzzleAttempt, invalidQueueEntry)
      ).rejects.toThrow();
    });

    it('should validate configuration values are within bounds', async () => {
      const invalidConfigs = [
        { ...mockConfig, minimumIntervalHours: -1 },
        { ...mockConfig, maximumIntervalDays: 0 },
        { ...mockConfig, minimumEaseFactor: 0 },
        { ...mockConfig, maximumEaseFactor: 0 }
      ];

      for (const config of invalidConfigs) {
        await expect(
          service.updateUserConfig('user-456', config)
        ).rejects.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.authenticate('user-456', 'test@example.com', 'lichess-user');
    });

    it('should handle network errors', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Network error'));
      mockSupabaseClient.from().update().eq().select().single = mockUpdate;

      await expect(
        service.recordPuzzleAttempt(mockPuzzleAttempt, mockQueueEntry)
      ).rejects.toThrow('Network error');
    });

    it('should handle authentication errors', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized', code: '401' }
      });
      mockSupabaseClient.from().update().eq().select().single = mockUpdate;

      await expect(
        service.recordPuzzleAttempt(mockPuzzleAttempt, mockQueueEntry)
      ).rejects.toThrow('Unauthorized');
    });
  });
}); 