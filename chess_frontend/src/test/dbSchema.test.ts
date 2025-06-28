import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

// Skip in CI environment where we don't have database access
const shouldSkip = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

describe.skipIf(shouldSkip)('Database schema validation', () => {
  it('profiles table has required columns', async () => {
    const { data, error } = await supabase.rpc('get_profile_columns');
    expect(error).toBeNull();
    const columns = (data as { column_name: string }[] | null)?.map(col => col.column_name) || [];
    expect(columns).toEqual(expect.arrayContaining(['lichess_username', 'access_token', 'created_at', 'updated_at']));
  });
});
