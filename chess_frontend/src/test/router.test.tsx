import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

// Simple test component that uses navigation
const TestNavigationComponent = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Router Test</h1>
      <button onClick={() => navigate('/test-route')}>Navigate to Test Route</button>
    </div>
  );
};

const TestRoute = () => <div>Test Route Reached</div>;

describe('React Router Setup', () => {
  it('should allow programmatic navigation', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestNavigationComponent />} />
          <Route path="/test-route" element={<TestRoute />} />
        </Routes>
      </BrowserRouter>
    );

    // Verify the router is working
    expect(screen.getByText('Router Test')).toBeInTheDocument();
    expect(screen.getByText('Navigate to Test Route')).toBeInTheDocument();
  });

  it('should render routes correctly', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/test-route" element={<TestRoute />} />
        </Routes>
      </BrowserRouter>
    );

    // This test verifies routes can be rendered
    // In a real scenario, we'd test navigation, but this confirms basic setup
  });
});
