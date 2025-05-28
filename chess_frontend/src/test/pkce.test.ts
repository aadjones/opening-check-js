import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generatePKCE, storeCodeVerifier, getStoredCodeVerifier, clearCodeVerifier } from '../lib/auth/pkce';

// Mock sessionStorage for testing
const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockSessionStorage.store[key] || null,
  setItem: (key: string, value: string) => { mockSessionStorage.store[key] = value; },
  removeItem: (key: string) => { delete mockSessionStorage.store[key]; },
  clear: () => { mockSessionStorage.store = {}; },
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('PKCE Utilities', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  afterEach(() => {
    mockSessionStorage.clear();
  });

  describe('generatePKCE', () => {
    it('should generate valid PKCE parameters', async () => {
      const pkce = await generatePKCE();

      expect(pkce).toHaveProperty('codeVerifier');
      expect(pkce).toHaveProperty('codeChallenge');
      expect(pkce).toHaveProperty('codeChallengeMethod');

      expect(typeof pkce.codeVerifier).toBe('string');
      expect(typeof pkce.codeChallenge).toBe('string');
      expect(pkce.codeChallengeMethod).toBe('S256');

      // Code verifier should be base64url encoded (no padding)
      expect(pkce.codeVerifier).not.toContain('=');
      expect(pkce.codeVerifier).not.toContain('+');
      expect(pkce.codeVerifier).not.toContain('/');

      // Code challenge should be base64url encoded (no padding)
      expect(pkce.codeChallenge).not.toContain('=');
      expect(pkce.codeChallenge).not.toContain('+');
      expect(pkce.codeChallenge).not.toContain('/');
    });

    it('should generate different values each time', async () => {
      const pkce1 = await generatePKCE();
      const pkce2 = await generatePKCE();

      expect(pkce1.codeVerifier).not.toBe(pkce2.codeVerifier);
      expect(pkce1.codeChallenge).not.toBe(pkce2.codeChallenge);
    });

    it('should generate code verifier of appropriate length', async () => {
      const pkce = await generatePKCE();
      
      // Base64url encoded 32 bytes should be 43 characters
      expect(pkce.codeVerifier.length).toBe(43);
    });
  });

  describe('code verifier storage', () => {
    it('should store and retrieve code verifier', () => {
      const testVerifier = 'test-code-verifier-123';
      
      storeCodeVerifier(testVerifier);
      const retrieved = getStoredCodeVerifier();
      
      expect(retrieved).toBe(testVerifier);
    });

    it('should return null when no verifier is stored', () => {
      const retrieved = getStoredCodeVerifier();
      expect(retrieved).toBeNull();
    });

    it('should clear stored code verifier', () => {
      const testVerifier = 'test-code-verifier-456';
      
      storeCodeVerifier(testVerifier);
      expect(getStoredCodeVerifier()).toBe(testVerifier);
      
      clearCodeVerifier();
      expect(getStoredCodeVerifier()).toBeNull();
    });
  });
}); 