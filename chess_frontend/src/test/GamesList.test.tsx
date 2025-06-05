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
    hasDeviation: false
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
    deviation: {
      id: 'dev1',
      whole_move_number: 10,
      deviation_san: 'Nxe4',
      reference_san: 'Nf3',
      player_color: 'White',
      board_fen_before_deviation: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      reference_uci: 'g1f3',
      deviation_uci: 'b1c3',
      pgn: '1. e4 e5 2. Nf3 Nc6',
      opening_name: 'Ruy Lopez',
      move_number: 10,
      played_move: 'Nxe4',
      expected_move: 'Nf3',
      created_at: '2024-03-15T13:00:00Z',
      opponent: 'GM_Hikaru',
      game_url: 'https://lichess.org/def456',
      game_id: 'def456',
      time_control: '600',
      game_result: '0-1',
      reviewed: false,
      review_count: 0,
      ease_factor: 2.5,
      interval_days: 1,
      next_review_date: null,
      last_reviewed: null,
      is_resolved: false
    }
  }
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('GamesList', () => {
  it('renders loading state', () => {
    renderWithRouter(<GamesList games={[]} isLoading={true} />);
    expect(screen.getByTestId('games-list-loading')).toBeInTheDocument();
    expect(screen.getAllByTestId('game-card-skeleton')).toHaveLength(5);
  });

  it('renders empty state', () => {
    renderWithRouter(<GamesList games={[]} isLoading={false} />);
    expect(screen.getByTestId('games-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No games found')).toBeInTheDocument();
    expect(screen.getByText('Play some games on Lichess to see them here')).toBeInTheDocument();
  });

  it('renders list of games', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    expect(screen.getByTestId('games-list')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /View on Lichess/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Review Deviation/ })).toBeInTheDocument();
  });

  it('formats time control correctly', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    expect(screen.getByText('Blitz')).toBeInTheDocument();
    expect(screen.getByText('Rapid')).toBeInTheDocument();
  });

  it('formats game results correctly', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    expect(screen.getByText('✅ White won')).toBeInTheDocument();
    expect(screen.getByText('❌ Deviation')).toBeInTheDocument();
  });

  it('handles game click', () => {
    const onGameClick = vi.fn();
    renderWithRouter(<GamesList games={mockGames} onGameClick={onGameClick} />);
    
    const gameCards = screen.getAllByTestId('game-card');
    fireEvent.click(gameCards[0]);
    
    expect(onGameClick).toHaveBeenCalledWith(mockGames[0].gameId);
  });

  it('prevents click propagation on links', () => {
    const onGameClick = vi.fn();
    renderWithRouter(<GamesList games={mockGames} onGameClick={onGameClick} />);
    
    const lichessLink = screen.getAllByRole('link', { name: /View on Lichess/ })[0];
    fireEvent.click(lichessLink);
    
    expect(onGameClick).not.toHaveBeenCalled();
  });

  it('shows deviation link only for games with deviations', () => {
    renderWithRouter(<GamesList games={mockGames} />);
    
    const deviationLinks = screen.getAllByRole('link', { name: /Review Deviation/ });
    expect(deviationLinks).toHaveLength(1);
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