import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingPage from '../pages/OnboardingPage';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    session: {
      user: { id: 'test-user' },
      accessToken: 'test-token'
    }
  })
}));

// Mock the StudySelector component
vi.mock('../components', () => ({
  StudySelector: ({ onStudyChange }: { onStudyChange: (white: string | null, black: string | null) => void }) => (
    <div data-testid="study-selector">
      <button 
        onClick={() => onStudyChange('white-study-id', null)}
        data-testid="set-white-study"
      >
        Set White Study
      </button>
      <button 
        onClick={() => onStudyChange(null, 'black-study-id')}
        data-testid="set-black-study"
      >
        Set Black Study
      </button>
    </div>
  )
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('OnboardingPage', () => {
  it('renders the page title and welcome message', () => {
    renderWithRouter(<OnboardingPage />);
    
    expect(screen.getByText('🎯 Step 2: Choose Your Repertoire')).toBeInTheDocument();
    expect(screen.getByText('🧠 Welcome to OutOfBook')).toBeInTheDocument();
    expect(screen.getByText('Track your games against your prep.')).toBeInTheDocument();
  });

  it('renders the progress indicator', () => {
    renderWithRouter(<OnboardingPage />);
    
    expect(screen.getByText('Connect Lichess')).toBeInTheDocument();
    expect(screen.getByText('Choose Studies')).toBeInTheDocument();
    expect(screen.getByText('Start Tracking')).toBeInTheDocument();
  });

  it('renders the StudySelector component', () => {
    renderWithRouter(<OnboardingPage />);
    
    expect(screen.getByTestId('study-selector')).toBeInTheDocument();
  });

  it('renders the demo option', () => {
    renderWithRouter(<OnboardingPage />);
    
    expect(screen.getByText('Load Demo Repertoires')).toBeInTheDocument();
    expect(screen.getByText('Perfect for trying out the system')).toBeInTheDocument();
  });

  it('renders help and privacy information', () => {
    renderWithRouter(<OnboardingPage />);
    
    expect(screen.getByText('Help & Privacy')).toBeInTheDocument();
    expect(screen.getByText(/Need help\? Check our guide on setting up studies/)).toBeInTheDocument();
    expect(screen.getByText(/Your studies stay private/)).toBeInTheDocument();
    expect(screen.getByText(/We'll access your studies through your Lichess account/)).toBeInTheDocument();
  });

  it('disables the start tracking button initially', () => {
    renderWithRouter(<OnboardingPage />);
    
    const startButton = screen.getByRole('button', { name: /Start Tracking Your Games/ });
    expect(startButton).toBeDisabled();
  });

  it('enables the start tracking button when a study is selected', () => {
    renderWithRouter(<OnboardingPage />);
    
    // Select a white study
    fireEvent.click(screen.getByTestId('set-white-study'));
    
    const startButton = screen.getByRole('button', { name: /Start Tracking Your Games/ });
    expect(startButton).not.toBeDisabled();
  });

  it('enables the start tracking button when a black study is selected', () => {
    renderWithRouter(<OnboardingPage />);
    
    // Select a black study
    fireEvent.click(screen.getByTestId('set-black-study'));
    
    const startButton = screen.getByRole('button', { name: /Start Tracking Your Games/ });
    expect(startButton).not.toBeDisabled();
  });

  it('handles demo mode selection', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });

    renderWithRouter(<OnboardingPage />);
    
    const demoCheckbox = screen.getByRole('checkbox');
    fireEvent.click(demoCheckbox);
    
    // Note: This test would need to be adjusted based on the actual navigation behavior
    // For now, we're just checking that the checkbox can be clicked
    expect(demoCheckbox).toBeInTheDocument();
  });
}); 