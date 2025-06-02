import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateStudyAccess, 
  extractStudyId, 
  clearValidationCache,
  getCacheStats
} from '../lib/lichess/studyValidation';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('studyValidation', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearValidationCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractStudyId', () => {
    it('extracts study ID from basic URL', () => {
      const url = 'https://lichess.org/study/abc123';
      expect(extractStudyId(url)).toBe('abc123');
    });

    it('extracts study ID from URL with chapter', () => {
      const url = 'https://lichess.org/study/abc123/chapter-xyz';
      expect(extractStudyId(url)).toBe('abc123');
    });

    it('handles HTTP URLs', () => {
      const url = 'http://lichess.org/study/def456';
      expect(extractStudyId(url)).toBe('def456');
    });

    it('returns null for invalid URLs', () => {
      expect(extractStudyId('invalid-url')).toBeNull();
      expect(extractStudyId('https://example.com/study/abc123')).toBeNull();
      expect(extractStudyId('https://lichess.org/game/abc123')).toBeNull();
    });

    it('handles empty or null input', () => {
      expect(extractStudyId('')).toBeNull();
    });
  });

  describe('validateStudyAccess', () => {
    it('returns error for invalid URL format', async () => {
      const result = await validateStudyAccess('invalid-url');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid study URL format');
    });

    it('validates public study successfully', async () => {
      const mockStudyData = {
        id: 'abc123',
        name: 'Test Study',
        visibility: 'public',
        chapters: [
          { id: 'ch1', name: 'Chapter 1' },
          { id: 'ch2', name: 'Chapter 2' }
        ],
        owner: { id: 'user1', name: 'TestUser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      const result = await validateStudyAccess('https://lichess.org/study/abc123');

      expect(result.isValid).toBe(true);
      expect(result.studyName).toBe('Test Study');
      expect(result.isPublic).toBe(true);
      expect(result.chapterCount).toBe(2);
      expect(result.studyId).toBe('abc123');
    });

    it('validates private study with valid token', async () => {
      const mockStudyData = {
        id: 'abc123',
        name: 'Private Study',
        visibility: 'private',
        chapters: [{ id: 'ch1', name: 'Chapter 1' }],
        owner: { id: 'user1', name: 'TestUser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      const result = await validateStudyAccess('https://lichess.org/study/abc123', 'valid-token');

      expect(result.isValid).toBe(true);
      expect(result.studyName).toBe('Private Study');
      expect(result.isPublic).toBe(false);
      expect(result.chapterCount).toBe(1);
    });

    it('handles study not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await validateStudyAccess('https://lichess.org/study/nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Study not found');
    });

    it('handles private study without token (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const result = await validateStudyAccess('https://lichess.org/study/private123');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('This study is private. Please log in with Lichess');
    });

    it('handles access denied with token (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const result = await validateStudyAccess('https://lichess.org/study/private123', 'invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('This study is private and you don\'t have access to it');
    });

    it('handles rate limiting (429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const result = await validateStudyAccess('https://lichess.org/study/abc123');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Too many requests to Lichess');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validateStudyAccess('https://lichess.org/study/abc123');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('An unexpected error occurred');
    });

    it('handles server errors (500)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await validateStudyAccess('https://lichess.org/study/abc123');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Lichess API error');
    });

    it('falls back to public check when token fails', async () => {
      const mockStudyData = {
        id: 'abc123',
        name: 'Public Study',
        visibility: 'public',
        chapters: [{ id: 'ch1', name: 'Chapter 1' }],
        owner: { id: 'user1', name: 'TestUser' }
      };

      // First call with token fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Second call without token succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      const result = await validateStudyAccess('https://lichess.org/study/abc123', 'token');

      expect(result.isValid).toBe(true);
      expect(result.studyName).toBe('Public Study');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('caching', () => {
    it('caches successful validation results', async () => {
      const mockStudyData = {
        id: 'abc123',
        name: 'Test Study',
        visibility: 'public',
        chapters: [{ id: 'ch1', name: 'Chapter 1' }],
        owner: { id: 'user1', name: 'TestUser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      // First call
      const result1 = await validateStudyAccess('https://lichess.org/study/abc123');
      expect(result1.isValid).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await validateStudyAccess('https://lichess.org/study/abc123');
      expect(result2.isValid).toBe(true);
      expect(result2.studyName).toBe('Test Study');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('caches error results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      // First call
      const result1 = await validateStudyAccess('https://lichess.org/study/nonexistent');
      expect(result1.isValid).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await validateStudyAccess('https://lichess.org/study/nonexistent');
      expect(result2.isValid).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('provides cache statistics', async () => {
      expect(getCacheStats().size).toBe(0);

      const mockStudyData = {
        id: 'abc123',
        name: 'Test Study',
        visibility: 'public',
        chapters: [],
        owner: { id: 'user1', name: 'TestUser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      await validateStudyAccess('https://lichess.org/study/abc123');

      const stats = getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toContain('abc123');
    });

    it('clears cache correctly', async () => {
      const mockStudyData = {
        id: 'abc123',
        name: 'Test Study',
        visibility: 'public',
        chapters: [],
        owner: { id: 'user1', name: 'TestUser' }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStudyData)
      });

      await validateStudyAccess('https://lichess.org/study/abc123');
      expect(getCacheStats().size).toBe(1);

      clearValidationCache();
      expect(getCacheStats().size).toBe(0);

      // Should make new API call after cache clear
      await validateStudyAccess('https://lichess.org/study/abc123');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
}); 