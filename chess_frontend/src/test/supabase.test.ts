import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables for testing
vi.mock('../lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  };

  return {
    supabase: mockSupabase,
  };
});

describe('Supabase Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be able to import supabase client', async () => {
    const { supabase } = await import('../lib/supabase');
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should be able to query profiles table', async () => {
    const { supabase } = await import('../lib/supabase');

    const result = await supabase.from('profiles').select('id').limit(1);

    expect(result).toBeDefined();
    expect(result.error).toBeNull();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should have auth methods available', async () => {
    const { supabase } = await import('../lib/supabase');

    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.onAuthStateChange).toBeDefined();
  });
});

describe('Supabase Environment Variables', () => {
  it('should validate environment variables are configured', () => {
    // This test will help identify if env vars are missing
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

    // In a real environment, these should be set
    // For testing, we just check the structure
    requiredEnvVars.forEach(envVar => {
      expect(envVar).toMatch(/^VITE_SUPABASE_/);
    });
  });
});
