// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components';
import {
  LandingPage,
  Dashboard,
  DeviationDetail,
  Settings,
  Analysis,
  Demo,
  AuthCallback,
  OnboardingPage,
  ReviewQueue,
} from './pages';
import { AuthProvider } from './contexts/AuthJSContext';
import './styles/index.css';
import { SHOW_ANALYSIS_PAGE } from './featureFlags';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing page without layout */}
        <Route path="/" element={<LandingPage />} />

        {/* OAuth callback without layout */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* All other routes with layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Protected routes - require authentication */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deviation/:id"
                  element={
                    <ProtectedRoute>
                      <DeviationDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                {SHOW_ANALYSIS_PAGE && (
                  <Route
                    path="/analysis"
                    element={
                      <ProtectedRoute>
                        <Analysis />
                      </ProtectedRoute>
                    }
                  />
                )}
                <Route
                  path="/review-queue"
                  element={
                    <ProtectedRoute>
                      <ReviewQueue />
                    </ProtectedRoute>
                  }
                />

                {/* Public routes - no authentication required */}
                <Route path="/demo" element={<Demo />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
