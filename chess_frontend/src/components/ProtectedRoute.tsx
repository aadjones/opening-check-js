import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that requires authentication
 *
 * Features:
 * - Uses Auth.js session from our AuthJSContext
 * - Shows loading state while checking authentication
 * - Redirects unauthenticated users to landing page
 * - Supabase session sync is handled by AuthJSContext
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/' }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <h3>Checking authentication...</h3>
        <p style={{ color: '#666' }}>Please wait while we verify your session.</p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render the protected content
  console.log('ProtectedRoute: User authenticated, rendering protected content for', user.name);
  return <>{children}</>;
};

export default ProtectedRoute;
