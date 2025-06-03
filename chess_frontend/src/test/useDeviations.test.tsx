// src/hooks/useDeviations.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeviations } from '../hooks/useDeviations';
import { supabase } from '../lib/supabase';
import type { ApiDeviationResult } from '../types';

/* ------------------------------------------------------------------ */
/* 1. mock auth – always logged‑in as user 123                         */
/* ------------------------------------------------------------------ */
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: '123' } },
  }),
}));

/* ------------------------------------------------------------------ */
/* 2. helper to make a fake query builder                              */
/* ------------------------------------------------------------------ */
const makeQueryBuilder = (rows: ApiDeviationResult[], throwErr: boolean = false, total: number = rows.length) => {
  // Build a chainable object; every step returns itself.
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    range: vi.fn(() =>
      throwErr ? Promise.reject(new Error('Test error')) : Promise.resolve({ data: rows, error: null, count: total })
    ),
  };

  // Cast so TypeScript stops complaining about missing props
  return builder as unknown as ReturnType<typeof supabase.from>;
};

/* ------------------------------------------------------------------ */
/* 3. stub supabase.from                                               */
/* ------------------------------------------------------------------ */
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockDeviation: ApiDeviationResult = {
  id: 'test-id-1',
  whole_move_number: 10,
  deviation_san: 'e4',
  reference_san: 'd4',
  player_color: 'white',
  board_fen_before_deviation: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  reference_uci: 'd2d4',
  deviation_uci: 'e2e4',
  pgn: '1. e4',
  opening_name: 'Sicilian Defense',
  move_number: 1,
  played_move: 'e4',
  expected_move: 'd4',
  created_at: '2024-03-20T12:00:00Z',
  opponent: 'TestOpponent',
  game_url: 'https://lichess.org/test-game',
  game_id: 'test-game-1',
  time_control: 'Blitz 5+3',
  game_result: '1-0',
  reviewed: false,
  review_count: 0,
  ease_factor: 2.5,
  interval_days: 1,
  next_review_date: null,
  last_reviewed: null,
  is_resolved: false,
};

/* ------------------------------------------------------------------ */
/* 4. tests                                                            */
/* ------------------------------------------------------------------ */
describe('useDeviations', () => {
  beforeEach(() => {
    // default mock: one row, no error
    (supabase.from as Mock).mockReturnValue(makeQueryBuilder([mockDeviation]));
  });

  afterEach(() => vi.clearAllMocks());

  it('fetches deviations on mount', async () => {
    const { result } = renderHook(() => useDeviations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.deviations).toHaveLength(1);
    expect(result.current.deviations[0].deviation_san).toBe('e4');
    expect(result.current.hasMore).toBe(false);
  });

  it('propagates Supabase errors', async () => {
    // next call: throw
    (supabase.from as Mock).mockReturnValueOnce(makeQueryBuilder([], true));

    const { result } = renderHook(() => useDeviations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.deviations).toHaveLength(0);
  });

  it('appends rows when loadMore() succeeds', async () => {
    // first page: 1 row, count 2  → hasMore = true
    let call = 0;
    (supabase.from as Mock).mockImplementation(() => {
      call += 1;
      return call === 1
        ? makeQueryBuilder([mockDeviation], false, 2) // first query
        : makeQueryBuilder([{ ...mockDeviation, whole_move_number: 2 }]); // second query
    });

    const { result } = renderHook(() => useDeviations());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.deviations).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });
});
