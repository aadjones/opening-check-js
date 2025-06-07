import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { syncSupabaseSession } from '../lib/auth/supabaseSync';
import { startLichessOAuth, type LichessUser } from '../lib/auth/lichessOAuth';
import type { Session, User } from '@auth/core/types';

// Maintain the same interface as the original AuthContext
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'lichess') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Creates an Auth.js compatible session from Lichess user data
 */
function createSessionFromLichessUser(lichessUser: LichessUser, accessToken: string): Session {
  // Expect lichessUser.id to be the UUID (resolved in AuthCallback)
  const user: User = {
    id: lichessUser.id, // This is now the UUID
    name: lichessUser.username,
    email: lichessUser.email,
    image: `https://lichess1.org/assets/_Qk9Aqz/logo/lichess-favicon-32.png`,
    lichessUsername: lichessUser.username,
  };
  const session: Session = {
    user,
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    accessToken,
  };
  return session;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);

  const updateSession = useCallback(async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    currentUserIdRef.current = newSession?.user?.id ?? null;

    // Sync with Supabase
    await syncSupabaseSession(newSession);
  }, []);

  const checkForStoredSession = useCallback(async () => {
    try {
      // Check for stored Lichess user data
      const storedUser = sessionStorage.getItem('lichess_user');
      const storedToken = sessionStorage.getItem('lichess_access_token');

      if (storedUser && storedToken) {
        const lichessUser: LichessUser = JSON.parse(storedUser);

        // Only update if the user actually changed
        if (currentUserIdRef.current !== lichessUser.id) {
          const newSession = createSessionFromLichessUser(lichessUser, storedToken);
          console.log('Auth.js: Found stored session for user:', lichessUser.username);
          await updateSession(newSession);
        }
        return true;
      } else {
        // Clear session if no stored data and we currently have a session
        if (currentUserIdRef.current) {
          await updateSession(null);
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
      return false;
    }
  }, [updateSession]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Auth.js: Checking for existing session...');
        await checkForStoredSession();
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();
  }, [checkForStoredSession]);

  // Listen for storage changes (when OAuth completes in another tab/window)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lichess_user' || e.key === 'lichess_access_token') {
        console.log('Auth.js: Storage change detected, refreshing session...');
        checkForStoredSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkForStoredSession]);

  // Listen for custom session refresh events (for same-window OAuth completion)
  useEffect(() => {
    const handleSessionRefresh = () => {
      console.log('Auth.js: Session refresh requested...');
      checkForStoredSession();
    };

    window.addEventListener('auth-session-refresh', handleSessionRefresh);
    return () => window.removeEventListener('auth-session-refresh', handleSessionRefresh);
  }, [checkForStoredSession]);

  const signOut = async () => {
    try {
      setLoading(true);

      // Clear stored user data
      sessionStorage.removeItem('lichess_user');
      sessionStorage.removeItem('lichess_access_token');

      await updateSession(null);
      console.log('Auth.js: Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'lichess') => {
    try {
      setLoading(true);

      if (provider !== 'lichess') {
        throw new Error('Only Lichess OAuth is supported');
      }

      console.log('Auth.js: Starting Lichess OAuth flow...');

      // Start the real OAuth flow - this will redirect to Lichess
      await startLichessOAuth();

      // Note: This code won't execute because startLichessOAuth redirects the page
      // The loading state will be reset when the user returns from Lichess
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      setLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
