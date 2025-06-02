/**
 * Lichess Study Validation Module
 * 
 * This module handles validation of Lichess study URLs by:
 * 1. Checking if the study exists (public endpoint)
 * 2. Checking if the user has access (with their Lichess token)
 * 3. Providing detailed error messages for different scenarios
 * 4. Caching results to avoid repeated API calls
 */

// Study validation result interface
export interface StudyValidationResult {
  isValid: boolean;
  error?: string;
  studyName?: string;
  isPublic?: boolean;
  chapterCount?: number;
  studyId?: string;
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

// Cache for validation results (session-based)
const validationCache = new Map<string, { result: StudyValidationResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Extract study ID from Lichess study URL
 * Supports formats like:
 * - https://lichess.org/study/abc123
 * - https://lichess.org/study/abc123/chapter-id
 */
export function extractStudyId(url: string): string | null {
  const pattern = /lichess\.org\/study\/([a-zA-Z0-9]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Check if a cached validation result is still valid
 */
function getCachedResult(studyId: string): StudyValidationResult | null {
  const cached = validationCache.get(studyId);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    validationCache.delete(studyId);
    return null;
  }
  
  return cached.result;
}

/**
 * Cache a validation result
 */
function cacheResult(studyId: string, result: StudyValidationResult): void {
  validationCache.set(studyId, {
    result,
    timestamp: Date.now()
  });
}

/**
 * Check if study exists and get basic info (public endpoint)
 */
async function checkStudyExists(studyId: string): Promise<LichessStudyInfo | null> {
  try {
    const response = await fetch(`https://lichess.org/api/study/${studyId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // Study doesn't exist
    }

    if (response.status === 403) {
      // Study exists but is private - we'll handle this in the access check
      throw new Error('PRIVATE_STUDY');
    }

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const studyInfo: LichessStudyInfo = await response.json();
    return studyInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
}

/**
 * Check study access with user's Lichess token
 */
async function checkStudyAccess(studyId: string, accessToken: string): Promise<LichessStudyInfo | null> {
  try {
    const response = await fetch(`https://lichess.org/api/study/${studyId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return null; // Study doesn't exist
    }

    if (response.status === 403) {
      // User doesn't have access to this private study
      throw new Error('ACCESS_DENIED');
    }

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const studyInfo: LichessStudyInfo = await response.json();
    return studyInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
}

/**
 * Main validation function - validates study access via Lichess API
 * 
 * @param studyUrl - The Lichess study URL to validate
 * @param accessToken - Optional user's Lichess access token for private studies
 * @returns Promise<StudyValidationResult> - Detailed validation result
 */
export async function validateStudyAccess(
  studyUrl: string, 
  accessToken?: string
): Promise<StudyValidationResult> {
  // Extract study ID from URL
  const studyId = extractStudyId(studyUrl);
  if (!studyId) {
    return {
      isValid: false,
      error: 'Invalid study URL format. Please use a valid Lichess study URL like: https://lichess.org/study/abc123'
    };
  }

  // Check cache first
  const cachedResult = getCachedResult(studyId);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    let studyInfo: LichessStudyInfo | null = null;

    // First, try to access with user token if available
    if (accessToken) {
      try {
        studyInfo = await checkStudyAccess(studyId, accessToken);
      } catch (error) {
        if (error instanceof Error) {
          // If access denied with token, the study exists but user can't access it
          if (error.message === 'ACCESS_DENIED') {
            const result: StudyValidationResult = {
              isValid: false,
              error: 'This study is private and you don\'t have access to it. Please check with the study owner.',
              studyId
            };
            cacheResult(studyId, result);
            return result;
          }
          // For other errors with token, fall back to public check
        }
      }
    }

    // If no token or token check failed, try public access
    if (!studyInfo) {
      try {
        studyInfo = await checkStudyExists(studyId);
      } catch (error) {
        if (error instanceof Error) {
          let errorMessage: string;
          
          switch (error.message) {
            case 'PRIVATE_STUDY':
              errorMessage = accessToken 
                ? 'This study is private and you don\'t have access to it.'
                : 'This study is private. Please log in with Lichess to check if you have access.';
              break;
            case 'NETWORK_ERROR':
              errorMessage = 'Unable to connect to Lichess. Please check your internet connection and try again.';
              break;
            default:
              if (error.message.startsWith('HTTP_ERROR_429')) {
                errorMessage = 'Too many requests to Lichess. Please wait a moment and try again.';
              } else if (error.message.startsWith('HTTP_ERROR_')) {
                errorMessage = 'Lichess API error. Please try again later.';
              } else {
                errorMessage = 'An unexpected error occurred while validating the study.';
              }
          }

          const result: StudyValidationResult = {
            isValid: false,
            error: errorMessage,
            studyId
          };
          
          // Don't cache error results for too long
          return result;
        }
      }
    }

    // Study not found
    if (!studyInfo) {
      const result: StudyValidationResult = {
        isValid: false,
        error: 'Study not found. Please check the URL and make sure the study exists.',
        studyId
      };
      cacheResult(studyId, result);
      return result;
    }

    // Success! Study is accessible
    const result: StudyValidationResult = {
      isValid: true,
      studyName: studyInfo.name,
      isPublic: studyInfo.visibility === 'public',
      chapterCount: studyInfo.chapters.length,
      studyId: studyInfo.id
    };

    cacheResult(studyId, result);
    return result;

  } catch (error) {
    // Catch-all for unexpected errors
    const result: StudyValidationResult = {
      isValid: false,
      error: 'An unexpected error occurred while validating the study. Please try again.',
      studyId
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
    entries: Array.from(validationCache.keys())
  };
} 