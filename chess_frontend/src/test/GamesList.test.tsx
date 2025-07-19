import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GamesList, { type GameListItem } from '../components/GamesList';

const mockGames: GameListItem[] = [
  {
    id: '1',
    gameId: 'abc123',
    gameUrl: 'https://lichess.org/abc123',
    opponent: 'ChessBot',
    timeControl: '180', // 3 minutes
    gameResult: '1-0',
    playedAt: '2024-03-15T12:00:00Z',
    hasDeviation: false,
    outcome: 'win',
  },
  {
    id: '2',
    gameId: 'def456',
    gameUrl: 'https://lichess.org/def456',
    opponent: 'GM_Hikaru',
    timeControl: '600', // 10 minutes
    gameResult: '0-1',
    playedAt: '2024-03-15T13:00:00Z',
    hasDeviation: true,
    firstDeviator: 'user',
    outcome: 'loss',
    deviation: {
      id: 'dev1',
      user_id: 'user-uuid',
      study_id: 'study-uuid',
      game_id: 'game-uuid',
      position_fen: 'some-fen',
      expected_move: 'e4',
      actual_move: 'd4',
      move_number: 1,
      color: 'white',
      detected_at: '2025-06-05T12:00:00Z',
      reviewed_at: null,
      review_result: null,
      pgn: '[Event "Test"]\n1. e4 e5 2. Nf3 Nc6',
      deviation_uci: null,
      reference_uci: null,
      first_deviator: 'user',
      review_status: 'needs_review',
      opening_name: 'Sicilian Defense',
    },
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('GamesList', () => {
  it('renders loading state', () => {
    renderWithRouter(<GamesList games={[]} isLoading={true} />);
    expect(screen.getByTestId('games-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('game-card-skeleton')).toHaveLength(5);
  });

  it('renders empty state', () => {
    renderWithRouter(<GamesList games={[]} isLoading={false} />);
    expect(screen.getByText('No recent games found')).toBeInTheDocument();
  });

  it('renders list of games', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    expect(screen.getByTestId('games-list')).toBeInTheDocument();
    expect(screen.getByText('vs ChessBot')).toBeInTheDocument();
    expect(screen.getByText('vs GM_Hikaru')).toBeInTheDocument();
  });

  it('formats game results correctly', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    expect(screen.getByText('win', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/You deviated/)).toBeInTheDocument();
  });

  it('handles game click', () => {
    const onGameClick = vi.fn();
    renderWithRouter(<GamesList games={mockGames} onGameClick={onGameClick} />);

    const gameCards = screen.getAllByTestId('game-card');
    fireEvent.click(gameCards[0]);

    expect(onGameClick).toHaveBeenCalledWith(mockGames[0].gameId);
  });

  it('is accessible', () => {
    renderWithRouter(<GamesList games={mockGames} onGameClick={() => {}} />);

    const gameCards = screen.getAllByTestId('game-card');
    gameCards.forEach(card => {
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('vs'));
    });
  });
});
