// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components';
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/deviation/:id" element={<DeviationDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analysis" element={<Analysis />} />
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
