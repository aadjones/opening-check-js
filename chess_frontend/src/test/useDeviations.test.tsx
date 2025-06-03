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
      throwErr
        ? Promise.reject(new Error('Test error'))
        : Promise.resolve({ data: rows.map(row => ({ ...row })), error: null, count: total })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDeviation: any = {
  id: 'test-id-1',
  whole_move_number: 10,
  deviation_san: '', // will be filled by hook mapping
  reference_san: '', // will be filled by hook mapping
  player_color: '', // will be filled by hook mapping
  board_fen_before_deviation: '', // will be filled by hook mapping
  reference_uci: null,
  deviation_uci: null,
  pgn: '',
  opening_name: null,
  move_number: 10,
  played_move: '', // will be filled by hook mapping
  created_at: '', // will be filled by hook mapping
  opponent: null,
  game_url: '',
  game_id: 'test-game-1',
  time_control: null,
  game_result: null,
  reviewed: false,
  review_count: 0,
  ease_factor: 2.5,
  interval_days: 1,
  next_review_date: null,
  last_reviewed: null,
  is_resolved: false,
  // DB fields expected by the hook
  actual_move: 'e4',
  expected_move: 'd4', // only the DB field, not the ApiDeviationResult field
  color: 'white',
  position_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  detected_at: '2024-03-20T12:00:00Z',
  review_result: 'not_reviewed',
  reviewed_at: null,
  // Some ApiDeviationResult fields are omitted or left blank because the hook fills them
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
