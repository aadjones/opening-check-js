import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is not set. Supabase functionality will be limited.');
}

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not set. Supabase functionality will be limited.');
}

// Create Supabase client
// Use fallback values for development/testing when env vars are not set
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js';
