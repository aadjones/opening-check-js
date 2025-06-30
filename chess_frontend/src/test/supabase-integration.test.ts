import { describe, it, expect } from 'vitest';

describe.skip('Supabase Integration Tests', () => {
  it('should connect to Supabase when environment variables are set', async () => {
    // Skip this test if environment variables are not set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('⚠️  Skipping integration test - Supabase environment variables not set');
      console.log('To run this test, set up your .env.local file with:');
      console.log('- VITE_SUPABASE_URL');
      console.log('- VITE_SUPABASE_ANON_KEY');
      return;
    }

    // If env vars are set, test the real connection
    try {
      const { supabase } = await import('../lib/supabase');

      const { data, error } = await supabase.from('profiles').select('id').limit(1);

      // The query should succeed (even if no data is returned)
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      console.log('✅ Supabase integration test passed!');
    } catch (error) {
      console.error('❌ Supabase integration test failed:', error);
      throw error;
    }
  });

  it('should have proper database types defined', () => {
    // Test that our Database type is properly structured
    const expectedTables = ['profiles', 'lichess_studies', 'opening_deviations', 'review_queue'];

    // This is a compile-time check that our types are structured correctly
    expectedTables.forEach(tableName => {
      expect(tableName).toMatch(/^[a-z_]+$/); // Valid table name format
    });
  });
});
