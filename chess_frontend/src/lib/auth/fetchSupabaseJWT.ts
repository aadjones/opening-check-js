import { createClient } from '@supabase/supabase-js';

// Provide sensible fallbacks for test / CI environments where Vite env vars may be undefined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// If we are running with placeholder credentials (e.g. during unit tests), we don't want to
// hit the real network. In that case, we'll create the client but later short-circuit the
// function call to return a dummy JWT.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchSupabaseJWT({
  sub,
  email,
  lichess_username,
}: {
  sub: string;
  email?: string;
  lichess_username?: string;
}): Promise<string> {
  // In placeholder mode we just return a fake token to satisfy calling code.
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return 'test-jwt-token';
  }

  const { data, error } = await supabase.functions.invoke('sign-jwt', {
    body: { sub, email, lichess_username },
  });
  if (error) throw error;
  return data.token as string;
}
