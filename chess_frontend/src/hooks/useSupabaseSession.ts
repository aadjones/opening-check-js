import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Session } from '@supabase/supabase-js';

/**
 * Hook for managing Supabase session state that works with Auth.js
 * This ensures RLS policies work correctly with our custom JWT
 */
export function useSupabaseSession() {
  const { session: authSession } = useAuth();
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!authSession?.user?.id) {
          if (mounted) {
            setSupabaseSession(null);
          }
          return;
        }

        // Get current Supabase session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // If we have an Auth.js session but no Supabase session, or if the user ID changed,
        // we need to update the Supabase session
        if (!session || session.user.id !== authSession.user.id) {
          // In a real implementation, this would call a serverless function to get a signed JWT
          // For now, we'll just use the Auth.js session directly
          const {
            data: { session: newSession },
            error: updateError,
          } = await supabase.auth.setSession({
            access_token: authSession.accessToken || '',
            refresh_token: '', // We don't use refresh tokens with Auth.js
          });

          if (updateError) {
            throw updateError;
          }

          if (mounted) {
            setSupabaseSession(newSession);
          }
        } else if (mounted) {
          setSupabaseSession(session);
        }
      } catch (err) {
        console.error('Error syncing Supabase session:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to sync session'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    syncSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSupabaseSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authSession]);

  return {
    session: supabaseSession,
    loading,
    error,
  };
}
