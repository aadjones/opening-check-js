import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generatePKCE, storeCodeVerifier, getStoredCodeVerifier, clearCodeVerifier } from '../lib/auth/pkce';

// Mock crypto.subtle for testing
const mockDigest = vi.fn().mockImplementation(async (_algorithm, data) => {
  // Return a mock hash that's consistent for the same input
  const str = new TextDecoder().decode(data);
  const hash = Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Return a 32-byte array (which will encode to 43 characters in base64url)
  const result = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    result[i] = (hash + i) % 256;
  }
  return result;
});

// Keep track of how many times getRandomValues is called
let randomCallCount = 0;

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
    getRandomValues: (arr: Uint8Array) => {
      // Generate different values each time by using the call count
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (i + randomCallCount) % 256;
      }
      randomCallCount += arr.length;
      return arr;
    },
  },
});

// Mock sessionStorage for testing
const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockSessionStorage.store[key] || null,
  setItem: (key: string, value: string) => {
    mockSessionStorage.store[key] = value;
  },
  removeItem: (key: string) => {
    delete mockSessionStorage.store[key];
  },
  clear: () => {
    mockSessionStorage.store = {};
  },
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

      // Length requirements
      expect(pkce.codeVerifier.length).toBeGreaterThanOrEqual(43);
      expect(pkce.codeVerifier.length).toBeLessThanOrEqual(128);
      expect(pkce.codeChallenge.length).toBe(43);
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
