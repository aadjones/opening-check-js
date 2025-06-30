// src/test/png.test.ts

import { describe, test, expect } from 'vitest';
import { parsePgnHeaders } from '../utils/pgn';

describe('parsePgnHeaders', () => {
  // Test Case 1: The exact PGN string that is failing
  test('should correctly parse headers from a real Lichess PGN', () => {
    const pgn = `
[Event "rated blitz game"]
[Site "https://lichess.org/3Hos1xwq"]
[Date "2025.06.11"]
[White "HarpSeal"]
[Black "Al3xisonf1re"]
[Result "0-1"]
[GameId "3Hos1xwq"]
[UTCDate "2025.06.11"]
[UTCTime "21:27:16"]
[WhiteElo "2276"]
[BlackElo "2242"]
[WhiteRatingDiff "-19"]
[BlackRatingDiff "+6"]
[WhiteTitle "NM"]
[Variant "Standard"]
[TimeControl "180+2"]
[ECO "B02"]
[Opening "Alekhine Defense: Scandinavian Variation"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4 Nf6 *
`;
    const headers = parsePgnHeaders(pgn);

    // Assert that the key headers are present and correct
    expect(headers.Event).toBe('rated blitz game');
    expect(headers.White).toBe('HarpSeal');
    expect(headers.Black).toBe('Al3xisonf1re');
    expect(headers.Result).toBe('0-1');
    expect(headers.TimeControl).toBe('180+2');
    // This is the most important assertion for our bug
    expect(headers.Opening).toBe('Alekhine Defense: Scandinavian Variation');
  });

  // Test Case 2: A simpler PGN string
  test('should parse a simple PGN with minimal headers', () => {
    const pgn = '[White "User1"]\n[Black "User2"]\n\n1. d4 *';
    const headers = parsePgnHeaders(pgn);
    expect(headers.White).toBe('User1');
    expect(headers.Black).toBe('User2');
  });

  // Test Case 3: A PGN with no headers
  test('should return an empty object for a PGN with no headers', () => {
    const pgn = '1. e4 e5 *';
    const headers = parsePgnHeaders(pgn);
    expect(Object.keys(headers).length).toBe(0);
  });

  // Test Case 4: A PGN with extra spaces
  test('should handle extra whitespace within the tags', () => {
    const pgn = '[  Opening   "King\'s Gambit Accepted"  ]\n1. e4 e5 2. f4 exf4 *';
    const headers = parsePgnHeaders(pgn);
    expect(headers.Opening).toBe("King's Gambit Accepted");
  });
});
