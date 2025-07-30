// src/test/reviewQueueDeduplication.test.ts
import { describe, it, expect } from 'vitest';

// Mock deviation data for testing
interface MockDeviation {
  id: string;
  user_id: string;
  position_fen: string;
  expected_move: string;
  color: string;
  actual_move: string;
}

// Extract the deduplication logic from ReviewQueue for testing
function deduplicateDeviations(deviations: MockDeviation[]): MockDeviation[] {
  const uniquePositions = new Map<string, MockDeviation>();

  deviations.forEach(deviation => {
    const positionKey = `${deviation.position_fen}|${deviation.expected_move}|${deviation.color}`;
    if (!uniquePositions.has(positionKey)) {
      uniquePositions.set(positionKey, deviation);
    }
  });

  return Array.from(uniquePositions.values());
}

describe('Review Queue Deduplication Logic', () => {
  const mockDeviations: MockDeviation[] = [
    {
      id: 'deviation-1',
      user_id: 'test-user',
      position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      expected_move: 'e5',
      color: 'black',
      actual_move: 'd6', // Different actual move
    },
    {
      id: 'deviation-2',
      user_id: 'test-user',
      position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      expected_move: 'e5',
      color: 'black',
      actual_move: 'f6', // Different actual move, SAME position - should be deduplicated
    },
    {
      id: 'deviation-3',
      user_id: 'test-user',
      position_fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      expected_move: 'Nf3',
      color: 'white',
      actual_move: 'd3', // Different position - should NOT be deduplicated
    },
  ];

  it('should deduplicate deviations with same position_fen + expected_move + color', () => {
    const result = deduplicateDeviations(mockDeviations);

    // Should only have 2 unique positions (deviation-1 and deviation-3)
    expect(result).toHaveLength(2);

    // Should keep the first occurrence of each unique position
    const resultIds = result.map(d => d.id);
    expect(resultIds).toContain('deviation-1');
    expect(resultIds).toContain('deviation-3');
    expect(resultIds).not.toContain('deviation-2'); // Should be filtered out
  });

  it('should treat different colors as different positions', () => {
    const samePositionDifferentColors: MockDeviation[] = [
      {
        id: 'white-to-move',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'Nf3',
        color: 'white',
        actual_move: 'd3',
      },
      {
        id: 'black-to-move',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'e5',
        color: 'black',
        actual_move: 'd6',
      },
    ];

    const result = deduplicateDeviations(samePositionDifferentColors);

    // Should keep both because color is different
    expect(result).toHaveLength(2);
    expect(result.map(d => d.id)).toEqual(['white-to-move', 'black-to-move']);
  });

  it('should treat different expected moves as different positions', () => {
    const samePositionDifferentExpected: MockDeviation[] = [
      {
        id: 'expected-e5',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'e5',
        color: 'black',
        actual_move: 'd6',
      },
      {
        id: 'expected-c5',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'c5',
        color: 'black',
        actual_move: 'd6',
      },
    ];

    const result = deduplicateDeviations(samePositionDifferentExpected);

    // Should keep both because expected move is different
    expect(result).toHaveLength(2);
    expect(result.map(d => d.id)).toEqual(['expected-e5', 'expected-c5']);
  });

  it('should handle empty array', () => {
    const result = deduplicateDeviations([]);
    expect(result).toHaveLength(0);
  });

  it('should handle single deviation', () => {
    const result = deduplicateDeviations([mockDeviations[0]]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('deviation-1');
  });

  it('should keep first occurrence when deduplicating', () => {
    const duplicates: MockDeviation[] = [
      {
        id: 'first',
        user_id: 'test-user',
        position_fen: 'same-fen',
        expected_move: 'same-move',
        color: 'white',
        actual_move: 'different1',
      },
      {
        id: 'second',
        user_id: 'test-user',
        position_fen: 'same-fen',
        expected_move: 'same-move',
        color: 'white',
        actual_move: 'different2',
      },
      {
        id: 'third',
        user_id: 'test-user',
        position_fen: 'same-fen',
        expected_move: 'same-move',
        color: 'white',
        actual_move: 'different3',
      },
    ];

    const result = deduplicateDeviations(duplicates);

    // Should only keep the first occurrence
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('first');
  });

  it('should ignore actual_move when determining uniqueness', () => {
    const samePositionExpectedDifferentActual: MockDeviation[] = [
      {
        id: 'actual-d6',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'e5',
        color: 'black',
        actual_move: 'd6',
      },
      {
        id: 'actual-f6',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'e5',
        color: 'black',
        actual_move: 'f6', // Different actual move but same position/expected
      },
      {
        id: 'actual-a6',
        user_id: 'test-user',
        position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        expected_move: 'e5',
        color: 'black',
        actual_move: 'a6', // Another different actual move
      },
    ];

    const result = deduplicateDeviations(samePositionExpectedDifferentActual);

    // Should only keep one puzzle regardless of different actual moves
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('actual-d6'); // First one
  });
});
