import jwt from 'jsonwebtoken';

export interface SupabaseJWTPayload {
  sub: string; // user ID
  email?: string;
  role: 'authenticated';
  lichess_username?: string;
  aud: 'authenticated';
  exp: number;
  iat: number;
}

/**
 * Signs a custom JWT for Supabase RLS compatibility
 * This should only be called server-side where SUPABASE_JWT_SECRET is available
 */
export function signSupabaseJWT(payload: Omit<SupabaseJWTPayload, 'aud' | 'exp' | 'iat'>): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60; // 1 hour (as recommended)

  const fullPayload: SupabaseJWTPayload = {
    ...payload,
    aud: 'authenticated',
    iat: now,
    exp: now + expiresIn,
  };

  return jwt.sign(fullPayload, secret, {
    algorithm: 'HS256',
  });
}

/**
 * Verifies a Supabase JWT (for testing purposes)
 */
export function verifySupabaseJWT(token: string): SupabaseJWTPayload {
  const secret = process.env.SUPABASE_JWT_SECRET;
  
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not configured');
  }

  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
  }) as SupabaseJWTPayload;
} 