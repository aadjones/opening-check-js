/**
 * Application configuration
 * 
 * Security: All configuration values are validated to prevent injection attacks
 */

// Validate API base URL to prevent injection attacks
const validateApiUrl = (url: string): string => {
  if (!url) return 'http://localhost:8000';
  
  // Allow localhost and secure protocols only
  const allowedPatterns = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    /^\/api$/, // Relative path for proxy
    /^$/ // Empty string for proxy
  ];
  
  const isValid = allowedPatterns.some(pattern => pattern.test(url));
  if (!isValid) {
    console.warn('Invalid API_BASE_URL detected, falling back to localhost');
    return 'http://localhost:8000';
  }
  
  return url;
};

export const API_BASE_URL = validateApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
