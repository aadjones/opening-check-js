// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components';
import { LandingPage, Dashboard, DeviationDetail, Settings, Analysis, Demo, AuthCallback } from './pages';
import { AuthProvider } from './contexts/AuthJSContext';
import './styles/index.css';

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
                <Route
                  path="/analysis"
                  element={
                    <ProtectedRoute>
                      <Analysis />
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
