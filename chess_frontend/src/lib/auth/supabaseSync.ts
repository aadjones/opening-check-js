import { supabase } from '../supabase';
import type { Session } from '@auth/core/types';

/**
 * Syncs Auth.js session with Supabase client
 * This sets the Supabase session using a custom JWT for RLS compatibility
 */
export async function syncSupabaseSession(authSession: Session | null): Promise<void> {
  try {
    if (!authSession?.user?.id) {
      // Sign out from Supabase if no Auth.js session
      await supabase.auth.signOut();
      return;
    }

    // For now, we'll use a placeholder approach
    // In the full implementation, this would get a signed JWT from the serverless function
    console.log('Would sync Supabase session for user:', authSession.user.id);

    // TODO: Replace with actual JWT from serverless function when API route is ready
    // const response = await fetch('/api/auth/supabase-jwt', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId: authSession.user.id,
    //     email: authSession.user.email,
    //     lichessUsername: authSession.user.lichessUsername,
    //   }),
    // });
    //
    // const { jwt } = await response.json();
    // await supabase.auth.setSession({
    //   access_token: jwt,
    //   refresh_token: 'placeholder',
    // });
  } catch (error) {
    console.error('Failed to sync Supabase session:', error);

    // Fail-closed: if we can't sync, sign out of Auth.js too
    // This will be implemented when we have the full Auth.js integration
    console.warn('Session sync failed - should sign out of Auth.js');
  }
}
