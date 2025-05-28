import React, { createContext, useEffect, useState, useCallback } from 'react';
import { syncSupabaseSession } from '../lib/auth/supabaseSync';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback(async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    // Sync with Supabase
    await syncSupabaseSession(newSession);
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // For now, we'll start with no session
        // In a full implementation, this would check for stored session
        console.log('Auth.js: Checking for existing session...');
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
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

      // For now, we'll simulate the OAuth flow
      // In the full implementation, this would redirect to Lichess
      console.log('Auth.js: Starting Lichess OAuth flow...');
      
      // TODO: Implement actual OAuth redirect
      // window.location.href = '/api/auth/signin/lichess';
      
      console.log('Auth.js: OAuth flow would redirect to Lichess');
      
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 