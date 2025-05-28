import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthJSContext';
import { useAuth } from '../hooks/useAuth';

// Mock the supabase sync function
vi.mock('../lib/auth/supabaseSync', () => ({
  syncSupabaseSession: vi.fn(),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, session, loading, signOut, signInWithOAuth } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={() => signInWithOAuth('lichess')} data-testid="signin">
        Sign In
      </button>
      <button onClick={signOut} data-testid="signout">
        Sign Out
      </button>
    </div>
  );
};

describe('AuthJSContext', () => {
  it('should provide auth context with initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('session')).toHaveTextContent('no-session');
  });

  it('should handle sign in with Lichess', async () => {
    // Mock console.log to avoid test output
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('signin');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Auth.js: Starting Lichess OAuth flow...');
    });

    consoleSpy.mockRestore();
  });

  it('should handle sign out', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByTestId('signout');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Auth.js: Signed out successfully');
    });

    consoleSpy.mockRestore();
  });

  it('should finish loading after initialization', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    consoleSpy.mockRestore();
  });
}); 