import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../contexts/AuthJSContext';
import type { Session, User } from '@auth/core/types';

// Mock the useAuth hook by providing AuthContext
const mockAuthContextValue = {
  user: null as User | null,
  session: null as Session | null,
  loading: false,
  signOut: vi.fn(),
  signInWithOAuth: vi.fn(),
};

// Test component to render inside ProtectedRoute
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

// Helper to render ProtectedRoute with mocked auth context
const renderProtectedRoute = (authValue = mockAuthContextValue) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock values
    mockAuthContextValue.user = null;
    mockAuthContextValue.session = null;
    mockAuthContextValue.loading = false;
  });

  it('should show loading state when authentication is being checked', () => {
    const loadingAuthValue = {
      ...mockAuthContextValue,
      loading: true,
    };

    renderProtectedRoute(loadingAuthValue);

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we verify your session.')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to landing page when user is not authenticated', () => {
    const unauthenticatedValue = {
      ...mockAuthContextValue,
      user: null,
      loading: false,
    };

    renderProtectedRoute(unauthenticatedValue);

    // Should not render protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Should not show loading state
    expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
  });

  it('should render protected content when user is authenticated', () => {
    const mockUser: User = {
      id: 'test-user-id',
      name: 'TestUser',
      email: 'test@example.com',
    };

    const mockSession: Session = {
      user: mockUser,
      expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };

    const authenticatedValue = {
      ...mockAuthContextValue,
      user: mockUser,
      session: mockSession,
      loading: false,
    };

    renderProtectedRoute(authenticatedValue);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Should not show loading or redirect
    expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
  });

  it('should handle custom redirect path', () => {
    const unauthenticatedValue = {
      ...mockAuthContextValue,
      user: null,
      loading: false,
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={unauthenticatedValue}>
          <ProtectedRoute redirectTo="/custom-login">
            <TestComponent />
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Should not render protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should transition from loading to authenticated state', () => {
    const mockUser: User = {
      id: 'test-user-id',
      name: 'TestUser',
      email: 'test@example.com',
    };

    // Start with loading state
    const { rerender } = renderProtectedRoute({
      ...mockAuthContextValue,
      loading: true,
    });

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();

    // Update to authenticated state
    rerender(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            ...mockAuthContextValue,
            user: mockUser,
            loading: false,
          }}
        >
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should transition from loading to unauthenticated state', () => {
    // Start with loading state
    const { rerender } = renderProtectedRoute({
      ...mockAuthContextValue,
      loading: true,
    });

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();

    // Update to unauthenticated state
    rerender(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            ...mockAuthContextValue,
            user: null,
            loading: false,
          }}
        >
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
