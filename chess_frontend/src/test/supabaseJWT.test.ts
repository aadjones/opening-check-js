import { describe, it, expect, beforeAll } from 'vitest';
import { signSupabaseJWT, verifySupabaseJWT } from '../lib/auth/supabaseJWT';

describe('Supabase JWT Helper', () => {
  beforeAll(() => {
    // Set up test environment variable
    process.env.SUPABASE_JWT_SECRET = 'test-secret-key-for-jwt-signing-at-least-32-chars';
  });

  it('should sign a valid JWT with required claims', () => {
    const payload = {
      sub: 'b84ac9f8-66be-41c1-af30-665e3600953c',
      email: 'test@example.com',
      role: 'authenticated' as const,
      lichess_username: 'testuser',
    };

    const token = signSupabaseJWT(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a signed JWT and return correct payload', () => {
    const payload = {
      sub: 'b84ac9f8-66be-41c1-af30-665e3600953c',
      email: 'verify@example.com',
      role: 'authenticated' as const,
      lichess_username: 'verifyuser',
    };

    const token = signSupabaseJWT(payload);
    const verified = verifySupabaseJWT(token);

    expect(verified.sub).toBe(payload.sub);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe('authenticated');
    expect(verified.lichess_username).toBe(payload.lichess_username);
    expect(verified.aud).toBe('authenticated');
    expect(verified.exp).toBeGreaterThan(verified.iat);
  });

  it('should throw error when SUPABASE_JWT_SECRET is not set', () => {
    const originalSecret = process.env.SUPABASE_JWT_SECRET;
    delete process.env.SUPABASE_JWT_SECRET;

    expect(() => {
      signSupabaseJWT({
        sub: 'b84ac9f8-66be-41c1-af30-665e3600953c',
        role: 'authenticated',
      });
    }).toThrow('SUPABASE_JWT_SECRET is not configured');

    // Restore the secret
    process.env.SUPABASE_JWT_SECRET = originalSecret;
  });

  it('should set expiry to 1 hour from now', () => {
    const beforeSign = Math.floor(Date.now() / 1000);

    const token = signSupabaseJWT({
      sub: 'b84ac9f8-66be-41c1-af30-665e3600953c',
      role: 'authenticated',
    });

    const verified = verifySupabaseJWT(token);
    const expectedExpiry = beforeSign + 60 * 60; // 1 hour

    expect(verified.exp).toBeGreaterThanOrEqual(expectedExpiry - 1); // Allow 1 second tolerance
    expect(verified.exp).toBeLessThanOrEqual(expectedExpiry + 1);
  });
});
