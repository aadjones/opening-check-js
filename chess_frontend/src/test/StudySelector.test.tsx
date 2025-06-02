import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudySelector from '../components/StudySelector';
import { AuthProvider } from '../contexts/AuthJSContext';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    session: null,
    user: null,
    loading: false,
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
  })
}));

// Mock the validation module
vi.mock('../lib/lichess/studyValidation', () => ({
  validateStudyAccess: vi.fn(),
  extractStudyId: vi.fn(),
  clearValidationCache: vi.fn(),
  getCacheStats: vi.fn(),
}));

describe('StudySelector', () => {
  const mockOnStudyChange = vi.fn();

  beforeEach(() => {
    mockOnStudyChange.mockClear();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  it('renders white and black study input fields', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    expect(screen.getByLabelText(/white repertoire study url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/black repertoire study url/i)).toBeInTheDocument();
  });

  it('validates white study URL format', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    const whiteInput = screen.getByLabelText(/white repertoire study url/i);
    
    // Invalid URL
    fireEvent.change(whiteInput, { target: { value: 'invalid-url' } });
    expect(screen.getByText(/please enter a valid lichess study url/i)).toBeInTheDocument();
    expect(mockOnStudyChange).not.toHaveBeenCalled();

    // Valid URL
    fireEvent.change(whiteInput, { target: { value: 'https://lichess.org/study/abc123' } });
    expect(screen.queryByText(/please enter a valid lichess study url/i)).not.toBeInTheDocument();
    expect(mockOnStudyChange).toHaveBeenCalledWith('abc123', null);
  });

  it('validates black study URL format', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    const blackInput = screen.getByLabelText(/black repertoire study url/i);
    
    // Invalid URL
    fireEvent.change(blackInput, { target: { value: 'invalid-url' } });
    expect(screen.getByText(/please enter a valid lichess study url/i)).toBeInTheDocument();
    expect(mockOnStudyChange).not.toHaveBeenCalled();

    // Valid URL
    fireEvent.change(blackInput, { target: { value: 'https://lichess.org/study/xyz789' } });
    expect(screen.queryByText(/please enter a valid lichess study url/i)).not.toBeInTheDocument();
    expect(mockOnStudyChange).toHaveBeenCalledWith(null, 'xyz789');
  });

  it('handles loading state', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} isLoading={true} />);
    
    const inputs = screen.getAllByRole('textbox');
    const buttons = screen.getAllByRole('button');
    
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows help links', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    const helpLinks = screen.getAllByText(/how to find your study url/i);
    expect(helpLinks).toHaveLength(2);
    
    helpLinks.forEach(link => {
      expect(link).toHaveAttribute('href', 'https://lichess.org/study');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('shows validate buttons', () => {
    renderWithAuth(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    const validateButtons = screen.getAllByText(/validate/i);
    expect(validateButtons).toHaveLength(2);
    
    validateButtons.forEach(button => {
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled(); // Should be disabled when no URL is entered
    });
  });
}); 