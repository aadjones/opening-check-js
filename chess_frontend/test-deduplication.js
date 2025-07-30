// Node.js test for Review Queue deduplication logic
// This tests the core deduplication logic implemented in ReviewQueue.tsx
//
// The logic deduplicates puzzles by: position_fen + expected_move + color
// It ignores actual_move, so different wrong moves from the same position
// create only one puzzle for learning.
function deduplicateDeviations(deviations) {
  const uniquePositions = new Map();

  deviations.forEach(deviation => {
    const positionKey = `${deviation.position_fen}|${deviation.expected_move}|${deviation.color}`;
    if (!uniquePositions.has(positionKey)) {
      uniquePositions.set(positionKey, deviation);
    }
  });

  return Array.from(uniquePositions.values());
}

// Test data
const mockDeviations = [
  {
    id: 'deviation-1',
    position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    expected_move: 'e5',
    color: 'black',
    actual_move: 'd6',
  },
  {
    id: 'deviation-2',
    position_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    expected_move: 'e5',
    color: 'black',
    actual_move: 'f6', // Different actual move, SAME position - should be deduplicated
  },
  {
    id: 'deviation-3',
    position_fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    expected_move: 'Nf3',
    color: 'white',
    actual_move: 'd3',
  },
];

// Run tests
console.log('Testing deduplication logic...');

const result = deduplicateDeviations(mockDeviations);
console.log(`Original count: ${mockDeviations.length}`);
console.log(`Deduplicated count: ${result.length}`);

// Test 1: Should deduplicate same position
if (result.length === 2) {
  console.log('✅ Test 1 PASSED: Deduplication working correctly');
} else {
  console.log('❌ Test 1 FAILED: Expected 2 unique positions, got', result.length);
}

// Test 2: Should keep first occurrence
const resultIds = result.map(d => d.id);
if (resultIds.includes('deviation-1') && resultIds.includes('deviation-3') && !resultIds.includes('deviation-2')) {
  console.log('✅ Test 2 PASSED: Kept first occurrence, filtered duplicate');
} else {
  console.log('❌ Test 2 FAILED: Incorrect deduplication logic');
  console.log('Result IDs:', resultIds);
}

// Test 3: Different colors should be different puzzles
const differentColors = [
  {
    id: 'white-move',
    position_fen: 'same-fen',
    expected_move: 'Nf3',
    color: 'white',
    actual_move: 'd3',
  },
  {
    id: 'black-move',
    position_fen: 'same-fen',
    expected_move: 'e5',
    color: 'black',
    actual_move: 'd6',
  },
];

const colorResult = deduplicateDeviations(differentColors);
if (colorResult.length === 2) {
  console.log('✅ Test 3 PASSED: Different colors treated as different positions');
} else {
  console.log('❌ Test 3 FAILED: Color differentiation not working');
}

console.log('\nAll tests completed!');
console.log('Final deduplicated result:');
console.log(
  result.map(d => ({
    id: d.id,
    fen: d.position_fen.substring(0, 20) + '...',
    expected: d.expected_move,
    color: d.color,
  }))
);
