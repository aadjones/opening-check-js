# tests/test_pgn_utils.py

from pgn_utils import pgn_string_to_game, walk_pgn_variations


def test_walk_pgn_variations_with_complex_pgn() -> None:
    """
    Tests that the generator can correctly parse a complex, real-world PGN
    string with multiple, nested variations and yields all path prefixes.
    """
    # This PGN is transcribed from the canonical example image.
    pgn = "1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) (2... Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4) 3. Bc4 Bc5 (3... Nf6 4. d3) 4. c3 Nf6 5. d3 d6 6. Bb3 *"

    game = pgn_string_to_game(pgn)

    # Get all yielded lines from the generator
    lines = list(walk_pgn_variations(game))

    # Convert results to a set of space-separated UCI strings for easy comparison
    uci_paths = {" ".join(move.uci() for move in line) for line in lines}

    # This is the ground truth: the set of all 21 possible paths and sub-paths
    # that should be extracted from the PGN.
    expected_paths = {
        # Common trunk
        "e2e4",
        "e2e4 e7e5",
        "e2e4 e7e5 g1f3",
        # Branch 1: Main line (2...Nc6) leading to Italian Game
        "e2e4 e7e5 g1f3 b8c6",
        "e2e4 e7e5 g1f3 b8c6 f1c4",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6",
        "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6 c4b3",
        # Branch 1a: Sideline within Italian Game (3...Nf6)
        "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6",
        "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3",
        # Branch 2: Philidor Defence sideline (2...d6)
        "e2e4 e7e5 g1f3 d7d6",
        "e2e4 e7e5 g1f3 d7d6 d2d4",
        # Branch 3: Petrov's Defence sideline (2...Nf6)
        "e2e4 e7e5 g1f3 g8f6",
        "e2e4 e7e5 g1f3 g8f6 f3e5",
        "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6",
        "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3",
        "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4",
        "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4 d2d4",
    }

    # Assert that the set of paths we got is identical to the set we expect.
    assert uci_paths == expected_paths


def test_walk_pgn_variations_simple_line() -> None:
    """Tests the generator with a simple, linear PGN with no variations."""
    pgn = "1. d4 Nf6 2. c4"
    game = pgn_string_to_game(pgn)

    lines = list(walk_pgn_variations(game))
    uci_paths = {" ".join(move.uci() for move in line) for line in lines}

    expected_paths = {
        "d2d4",
        "d2d4 g8f6",
        "d2d4 g8f6 c2c4",
    }

    assert uci_paths == expected_paths
