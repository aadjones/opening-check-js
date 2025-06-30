/**
 * Supabase Client Configuration
 *
 * This file runs in the browser and configures the Supabase client for database operations.
 * It uses the anon key for public database access and is separate from authentication.
 *
 * 🔐 Security Note: This client only has access to public tables and RLS-protected data.
 * For authenticated operations, we use Auth.js with Lichess OAuth instead of Supabase auth.
 */

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

// Create Supabase client for DATABASE OPERATIONS ONLY
// We use Auth.js with Lichess OAuth for authentication, not Supabase auth
// This client is only used for database queries with the anon key
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Export database-related types only (not auth types since we use Auth.js)
export type { User } from '@supabase/supabase-js';
