import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Layout from './Layout';
import { ThemeProvider } from '../../contexts/ThemeContext';

describe('Layout Component', () => {
  it('renders basic structure without exploding', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <h1>Dashboard Page</h1>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    // Check that Layout renders its core elements
    expect(screen.getByText('OutOfBook')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Check that children content is rendered
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();

    // Check that footer is present
    expect(screen.getByText(/© 2025 OutOfBook/)).toBeInTheDocument();
  });
});
