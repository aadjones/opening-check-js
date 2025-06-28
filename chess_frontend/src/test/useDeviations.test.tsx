// src/hooks/useDeviations.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeviations } from '../hooks/useDeviations';

// Mock auth – always logged‑in as user 123
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: '123' } },
  }),
}));

const mockDeviation = {
  id: 'test-id-1',
  actual_move: 'e4',
  expected_move: 'd4',
  color: 'white',
  position_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  detected_at: '2024-03-20T12:00:00Z',
  move_number: 10,
  pgn: '',
  game_id: 'test-game-1',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('useDeviations', () => {
  it('fetches deviations on mount', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockDeviation],
    });

    const { result } = renderHook(() => useDeviations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.deviations).toHaveLength(1);
    expect(result.current.deviations[0].actual_move).toBe('e4');
    expect(result.current.hasMore).toBe(false);
  });

  it('propagates fetch errors', async () => {
    (fetch as Mock).mockRejectedValueOnce(new Error('Test error'));

    const { result } = renderHook(() => useDeviations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.deviations).toHaveLength(0);
  });
});
