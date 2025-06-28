/**
 * Lichess Study Validation Module
 *
 * This module handles validation of Lichess study URLs by:
 * 1. Checking if the study exists (public endpoint)
 * 2. Checking if the user has access (with their Lichess token)
 * 3. Providing detailed error messages for different scenarios
 * 4. Caching results to avoid repeated API calls
 *
 * NOTE: Direct browser requests to Lichess API are blocked by CORS.
 * This module is prepared for backend/serverless proxy implementation.
 */

// Use relative path for config
import { API_BASE_URL } from '@/lib/config';
import type { ApiError } from './errorHandling';
import {
  isApiError as isApiErrorType,
  extractErrorMessage as extractErrorMessageUtil,
  shouldRetryRequest,
  getRetryAfterTime,
} from './errorHandling';

// Study validation result interface
export interface StudyValidationResult {
  isValid: boolean;
  error?: string;
  studyName?: string;
  isPublic?: boolean;
  chapterCount?: number;
  studyId?: string;
  corsBlocked?: boolean; // Flag to indicate CORS blocking
  retryAfter?: string;
}

// Study metadata from Lichess API
interface LichessStudyInfo {
  id: string;
  name: string;
  visibility: 'public' | 'unlisted' | 'private';
  chapters: Array<{
    id: string;
    name: string;
  }>;
  owner: {
    id: string;
    name: string;
  };
  members?: Array<{
    user: {
      id: string;
      name: string;
    };
    role: string;
  }>;
}

// Cache for study validation results
const validationCache = new Map<
  string,
  {
    result: boolean;
    timestamp: number;
    error?: ApiError;
  }
>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Use imported error handling utilities
const isApiError = isApiErrorType;
const extractErrorMessage = extractErrorMessageUtil;

/**
 * Extract study ID from Lichess study URL
 * Supports formats like:
 * - https://lichess.org/study/abc123
 * - https://lichess.org/study/abc123/chapter-id
 */
export function extractStudyId(url: string): string | null {
  if (!url) return null;

  // Match proxy URLs: /proxy/api/study/abc123 or /proxy/api/study/abc123/chapter-xyz
  let match = url.match(/\/proxy\/api\/study\/([a-zA-Z0-9]+)/);
  if (match) return match[1];

  // Match standard Lichess URLs: https://lichess.org/study/abc123 or https://lichess.org/study/abc123/chapter-xyz
  match = url.match(/lichess\.org\/study\/([a-zA-Z0-9]+)/);
  if (match) return match[1];

  return null;
}

/**
 * Check if a cached validation result is still valid
 */
function getCachedResult(studyId: string): boolean | null {
  const cached = validationCache.get(`exists:${studyId}`);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    validationCache.delete(`exists:${studyId}`);
    return null;
  }

  if (cached.error) {
    throw cached.error;
  }
  return cached.result;
}

/**
 * Cache a validation result
 */
function cacheResult(studyId: string, result: boolean): void {
  validationCache.set(`exists:${studyId}`, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Detect if we're running in a browser environment
 */
function isBrowserEnvironment(): boolean {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    return false;
  }
  return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const error = await response.json();
        if (!shouldRetryRequest(error)) {
          throw error;
        }
        // If we should retry, continue to next attempt
        lastError = error;
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (!shouldRetryRequest(error)) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError;
}

/**
 * Check if study exists and get basic info (public endpoint)
 * NOTE: This will fail in browser due to CORS - needs backend proxy
 */
export async function checkStudyExists(studyId: string): Promise<boolean> {
  const cacheKey = `exists:${studyId}`;
  const cached = validationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (cached.error) {
      throw cached.error;
    }
    return cached.result;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/proxy/lichess/api/study/${studyId}`, { method: 'HEAD' });

    const result = response.ok;
    validationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
    return result;
  } catch (error) {
    const apiError = isApiError(error)
      ? error
      : {
          error: 'Study validation error',
          message: extractErrorMessage(error),
        };
    validationCache.set(cacheKey, {
      result: false,
      timestamp: Date.now(),
      error: apiError,
    });
    throw apiError;
  }
}

/**
 * Check study access with user's Lichess token
 * NOTE: This will fail in browser due to CORS - needs backend proxy
 */
export async function checkStudyAccess(studyId: string): Promise<boolean> {
  const cacheKey = `access:${studyId}`;
  const cached = validationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (cached.error) {
      throw cached.error;
    }
    return cached.result;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/proxy/lichess/api/study/${studyId}`, { method: 'GET' });

    const result = response.ok;
    validationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
    return result;
  } catch (error) {
    const apiError = isApiError(error)
      ? error
      : {
          error: 'Study access error',
          message: extractErrorMessage(error),
        };
    validationCache.set(cacheKey, {
      result: false,
      timestamp: Date.now(),
      error: apiError,
    });
    throw apiError;
  }
}

/**
 * Temporary validation for browser environment
 * Just validates URL format until backend proxy is implemented
 */
function validateUrlFormatOnly(studyUrl: string): StudyValidationResult {
  const studyId = extractStudyId(studyUrl);
  if (!studyId) {
    return {
      isValid: false,
      error: 'Invalid study URL format. Please use a valid Lichess study URL like: https://lichess.org/study/abc123',
    };
  }

  // For now, assume valid format means valid study
  // This is a temporary workaround until backend validation is implemented
  return {
    isValid: true,
    studyName: `Study ${studyId} (Format Validated)`,
    isPublic: undefined, // Unknown without API access
    chapterCount: undefined, // Unknown without API access
    studyId,
    corsBlocked: true,
  };
}

/**
 * Main validation function - validates study access via Lichess API
 *
 * @param studyUrl - The Lichess study URL to validate
 * @param accessToken - Optional user's Lichess access token for private studies
 * @returns Promise<StudyValidationResult> - Detailed validation result
 */
export async function validateStudyAccess(studyUrl: string, accessToken?: string): Promise<StudyValidationResult> {
  // Extract study ID from URL
  const studyId = extractStudyId(studyUrl);
  if (!studyId) {
    return {
      isValid: false,
      error: 'Invalid study URL format. Please use a valid Lichess study URL like: https://lichess.org/study/abc123',
    };
  }

  // Check cache first
  const cachedResult = getCachedResult(studyId);
  if (cachedResult) {
    return {
      isValid: cachedResult,
      studyId,
    };
  }

  // If we're in a browser environment, we know CORS will block us
  if (isBrowserEnvironment()) {
    console.warn('🚫 CORS Limitation: Cannot validate Lichess studies directly from browser');
    console.warn('📝 Study URL format appears valid:', studyUrl);
    console.warn('🔧 Backend proxy needed for full validation');

    // Return format-only validation with CORS warning
    const result = validateUrlFormatOnly(studyUrl);
    result.error =
      '⚠️ Study validation temporarily limited due to browser security (CORS). URL format is valid, but we cannot verify the study exists until backend validation is implemented.';

    cacheResult(studyId, result.isValid);
    return result;
  }

  try {
    // Initialize studyInfo as undefined to help TypeScript with type narrowing
    let studyInfo: LichessStudyInfo | undefined;

    // First, try to access with user token if available
    if (accessToken) {
      try {
        const hasAccess = await checkStudyAccess(studyId);
        if (!hasAccess) {
          const result: StudyValidationResult = {
            isValid: false,
            error: 'You do not have access to this study',
            studyId,
          };
          cacheResult(studyId, result.isValid);
          return result;
        }
        // If we have access, fetch the study info
        const response = await fetchWithRetry(`${API_BASE_URL}/api/proxy/lichess/api/study/${studyId}`, {
          method: 'GET',
        });
        studyInfo = await response.json();
      } catch (error) {
        if (isApiError(error)) {
          // Handle rate limiting
          if (error.error === 'Rate limit exceeded') {
            const retryAfter = getRetryAfterTime(error);
            const result: StudyValidationResult = {
              isValid: false,
              error: extractErrorMessage(error),
              studyId,
              retryAfter: retryAfter?.toString(),
            };
            // Don't cache rate limit errors
            return result;
          }

          // Handle access denied
          if (error.error === 'Access denied') {
            const result: StudyValidationResult = {
              isValid: false,
              error: error.message,
              studyId,
            };
            cacheResult(studyId, result.isValid);
            return result;
          }

          // For other API errors, use the error message
          const result: StudyValidationResult = {
            isValid: false,
            error: error.message,
            studyId,
          };
          cacheResult(studyId, result.isValid);
          return result;
        }

        // Handle CORS blocking
        if (error instanceof Error && error.message === 'CORS_BLOCKED') {
          const result: StudyValidationResult = {
            isValid: false,
            error:
              '🚫 Browser security (CORS) prevents direct validation of Lichess studies. This feature requires a backend server to work properly.',
            studyId,
            corsBlocked: true,
          };
          cacheResult(studyId, result.isValid);
          return result;
        }

        // For other errors with token, fall back to public check
      }
    }

    // If no token or token check failed, try public access
    if (!studyInfo) {
      try {
        const exists = await checkStudyExists(studyId);
        if (!exists) {
          const result: StudyValidationResult = {
            isValid: false,
            error: 'Study not found',
            studyId,
          };
          cacheResult(studyId, result.isValid);
          return result;
        }
        // If study exists, fetch the study info
        const response = await fetchWithRetry(`${API_BASE_URL}/api/proxy/lichess/api/study/${studyId}`, {
          method: 'GET',
        });
        studyInfo = await response.json();
      } catch (error) {
        if (isApiError(error)) {
          // Handle rate limiting
          if (error.error === 'Rate limit exceeded') {
            const retryAfter = getRetryAfterTime(error);
            const result: StudyValidationResult = {
              isValid: false,
              error: extractErrorMessage(error),
              studyId,
              retryAfter: retryAfter?.toString(),
            };
            // Don't cache rate limit errors
            return result;
          }

          // Handle not found
          if (error.error === 'Not found') {
            const result: StudyValidationResult = {
              isValid: false,
              error: error.message,
              studyId,
            };
            cacheResult(studyId, result.isValid);
            return result;
          }

          // For other API errors, use the error message
          const result: StudyValidationResult = {
            isValid: false,
            error: error.message,
            studyId,
          };
          cacheResult(studyId, result.isValid);
          return result;
        }

        // Handle CORS blocking
        if (error instanceof Error && error.message === 'CORS_BLOCKED') {
          const result: StudyValidationResult = {
            isValid: false,
            error:
              '🚫 Browser security (CORS) prevents direct validation of Lichess studies. The URL format looks correct, but we cannot verify the study exists without a backend server.',
            studyId,
            corsBlocked: true,
          };
          return result;
        }

        // Handle network errors
        if (error instanceof Error && error.message === 'NETWORK_ERROR') {
          const result: StudyValidationResult = {
            isValid: false,
            error: 'Unable to connect to Lichess. Please check your internet connection and try again.',
            studyId,
          };
          return result;
        }

        // For any other errors, use a generic message
        const result: StudyValidationResult = {
          isValid: false,
          error: extractErrorMessage(error),
          studyId,
        };
        return result;
      }
    }

    // Study not found
    if (!studyInfo) {
      const result: StudyValidationResult = {
        isValid: false,
        error: 'Study not found. Please check the URL and make sure the study exists.',
        studyId,
      };
      cacheResult(studyId, result.isValid);
      return result;
    }

    // Success! Study is accessible
    const result: StudyValidationResult = {
      isValid: true,
      studyName: studyInfo.name,
      isPublic: studyInfo.visibility === 'public',
      chapterCount: studyInfo.chapters.length,
      studyId: studyInfo.id,
    };

    cacheResult(studyId, result.isValid);
    return result;
  } catch {
    // Catch-all for unexpected errors
    const result: StudyValidationResult = {
      isValid: false,
      error: 'An unexpected error occurred while validating the study. Please try again.',
      studyId,
    };
    return result;
  }
}

/**
 * Clear the validation cache (useful for testing or manual refresh)
 */
export function clearValidationCache(): void {
  validationCache.clear();
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: validationCache.size,
    entries: Array.from(validationCache.keys()),
  };
}
