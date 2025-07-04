/**
 * PKCE (Proof Key for Code Exchange) utilities for secure OAuth flow
 * Implements RFC 7636 with S256 code challenge method
 */

/**
 * Generates a cryptographically secure random string for code verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Creates SHA256 hash of code verifier for code challenge
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encoding (without padding)
 */
function base64URLEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates PKCE parameters for OAuth flow
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Stores code verifier securely (in sessionStorage for now)
 * 
 * ⚠️ SECURITY TODO: In production, this should be an HTTP-only cookie
 * to prevent XSS attacks from accessing the code verifier.
 * 
 * Current implementation uses sessionStorage which is acceptable for:
 * - Development and testing
 * - Applications with strong XSS protection
 * 
 * For production deployment, consider implementing:
 * - HTTP-only cookies with SameSite=Strict
 * - Server-side session storage
 * - Encrypted storage with short expiration
 */
export function storeCodeVerifier(verifier: string): void {
  sessionStorage.setItem('oauth_code_verifier', verifier);
}

/**
 * Retrieves stored code verifier
 */
export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem('oauth_code_verifier');
}

/**
 * Clears stored code verifier after use
 */
export function clearCodeVerifier(): void {
  sessionStorage.removeItem('oauth_code_verifier');
}
