import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudySelector from '../components/StudySelector';

describe('StudySelector', () => {
  const mockOnStudyChange = vi.fn();

  beforeEach(() => {
    mockOnStudyChange.mockClear();
  });

  it('renders white and black study input fields', () => {
    render(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    expect(screen.getByLabelText(/white repertoire study url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/black repertoire study url/i)).toBeInTheDocument();
  });

  it('validates white study URL format', () => {
    render(<StudySelector onStudyChange={mockOnStudyChange} />);
    
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
    render(<StudySelector onStudyChange={mockOnStudyChange} />);
    
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
    render(<StudySelector onStudyChange={mockOnStudyChange} isLoading={true} />);
    
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
    render(<StudySelector onStudyChange={mockOnStudyChange} />);
    
    const helpLinks = screen.getAllByText(/how to find your study url/i);
    expect(helpLinks).toHaveLength(2);
    
    helpLinks.forEach(link => {
      expect(link).toHaveAttribute('href', 'https://lichess.org/study');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 