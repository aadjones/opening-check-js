/**
 * Error handling utilities for Lichess API interactions.
 * This module provides centralized error handling and type definitions
 * for consistent error handling across the application.
 */

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface RateLimitError extends ApiError {
  error: 'Rate limit exceeded';
  details: {
    retry_after: string;
    limit_type: string;
    remaining: string;
  };
}

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') return false;
  const obj = error as Record<string, unknown>;
  return typeof obj.error === 'string' && typeof obj.message === 'string';
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return isApiError(error) && error.error === 'Rate limit exceeded';
}

export function extractErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function getRetryAfterTime(error: unknown): number | null {
  if (isRateLimitError(error)) {
    const retryAfter = parseInt(error.details.retry_after, 10);
    return isNaN(retryAfter) ? 60 : retryAfter;
  }
  return null;
}

export function shouldRetryRequest(error: unknown): boolean {
  // Don't retry rate limits - they need to be handled by the user
  if (isRateLimitError(error)) {
    return false;
  }
  // Don't retry auth errors
  if (isApiError(error) && error.error === 'Access denied') {
    return false;
  }
  // Don't retry not found errors
  if (isApiError(error) && error.error === 'Not found') {
    return false;
  }
  // Retry network errors and other unexpected errors
  return true;
}

export function formatErrorForDisplay(error: unknown): string {
  if (isRateLimitError(error)) {
    const retryAfter = getRetryAfterTime(error);
    return `Rate limit exceeded. Please try again in ${retryAfter} seconds.`;
  }
  return extractErrorMessage(error);
}
