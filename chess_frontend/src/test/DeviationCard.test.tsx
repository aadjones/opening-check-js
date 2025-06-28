import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeviationCard from '../components/DeviationCard';

describe('DeviationCard', () => {
  it('renders the title and link for a deviation', () => {
    render(
      <DeviationCard
        type="deviation"
        title="Deviation in Sicilian Defense"
        time="2024-06-01 12:00"
        opponent="ChessBot"
        gameUrl="https://lichess.org/abc123"
      />
    );
    expect(screen.getByText(/Deviation in Sicilian Defense/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Game on Lichess/ })).toHaveAttribute(
      'href',
      'https://lichess.org/abc123'
    );
  });
});
