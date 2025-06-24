"""
Tests for chess_utils module
"""

import chess

from chess_utils import calculate_previous_position_fen


class TestCalculatePreviousPositionFen:
    """Test the calculate_previous_position_fen function with real data from deviations"""

    def test_white_first_move_returns_none(self) -> None:
        """White's first move should return None (no previous position)"""
        pgn = """[Event "casual blitz game"]
[Site "https://lichess.org/JPlQ5hNs"]
[White "HarpSeal"]
[Black "maia9"]
[Result "1-0"]

1. e4 d5 2. exd5 Qxd5"""

        result = calculate_previous_position_fen(pgn, 1, "White")
        assert result is None

    def test_black_first_move_returns_starting_fen(self) -> None:
        """Black's first move should return the starting position"""
        pgn = """[Event "casual blitz game"]
[Site "https://lichess.org/JPlQ5hNs"]
[White "HarpSeal"]
[Black "maia9"]
[Result "1-0"]

1. e4 d5 2. exd5 Qxd5"""

        result = calculate_previous_position_fen(pgn, 1, "Black")
        assert result == chess.STARTING_FEN

    def test_black_second_move(self) -> None:
        """Black's second move should return position before White's second move (for animation)"""
        pgn = """[Event "casual blitz game"]
[Site "https://lichess.org/JPlQ5hNs"]
[White "HarpSeal"]
[Black "maia9"]
[Result "1-0"]

1. e4 d5 2. exd5 Qxd5"""

        result = calculate_previous_position_fen(pgn, 2, "Black")

        # For animating White's move 2.exd5, we need position before it: after 1...d5
        expected_board = chess.Board()
        expected_board.push_san("e4")
        expected_board.push_san("d5")
        expected_fen = expected_board.fen()

        assert result == expected_fen

    def test_real_deviation_move_7_black(self) -> None:
        """Test the real deviation case: Black's move 7 from HYm88lz9"""
        pgn = """[Event "casual blitz game"]
[Site "https://lichess.org/HYm88lz9"]
[White "maia9"]
[Black "HarpSeal"]
[Result "0-1"]

1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Bb4 6. Nxc6 bxc6 7. Bd3 O-O"""

        result = calculate_previous_position_fen(pgn, 7, "Black")

        # Manually verify: position after 6...bxc6, before 7...O-O
        expected_board = chess.Board()
        moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nc3", "Bb4", "Nxc6", "bxc6"]
        for move in moves:
            expected_board.push_san(move)
        expected_fen = expected_board.fen()

        assert result == expected_fen
        # This should NOT match the manually set wrong value in the DB
        wrong_db_value = "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2"
        assert result != wrong_db_value

    def test_real_deviation_move_13_black(self) -> None:
        """Test another real deviation case: Black's move 13 from khEBlJdA"""
        pgn = """[Event "rated blitz game"]
[Site "https://lichess.org/khEBlJdA"]
[White "NagumbeMabundo"]
[Black "HarpSeal"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Nf6 5. e5 d5 6. Bb5 Ne4 7. Nxd4 Bc5 8. Be3 O-O 9. Nxc6 bxc6 10. Bxc5 Nxc5 11. Bxc6 Rb8 12. Qxd5 Qe7 13. O-O Rxb2"""

        result = calculate_previous_position_fen(pgn, 13, "Black")

        # Should return a valid FEN (not None)
        assert result is not None
        assert isinstance(result, str)

        # Verify it's a valid FEN by creating a board from it
        test_board = chess.Board(result)
        assert test_board.is_valid()

    def test_empty_pgn_returns_none(self) -> None:
        """Empty or None PGN should return None"""
        assert calculate_previous_position_fen(None, 1, "White") is None
        assert calculate_previous_position_fen("", 1, "White") is None
        assert calculate_previous_position_fen("   ", 1, "White") is None

    def test_invalid_color_handling(self) -> None:
        """Test various color string formats"""
        pgn = """[Event "test"]
[Result "*"]

1. e4 e5"""

        # Test different color formats
        assert calculate_previous_position_fen(pgn, 1, "white") is None
        assert calculate_previous_position_fen(pgn, 1, "White") is None
        assert calculate_previous_position_fen(pgn, 1, "BLACK") == chess.STARTING_FEN
        assert calculate_previous_position_fen(pgn, 1, "black") == chess.STARTING_FEN

    def test_malformed_pgn_handling(self) -> None:
        """Test that malformed PGN is handled gracefully"""
        bad_pgn = "This is not a valid PGN"
        result = calculate_previous_position_fen(bad_pgn, 1, "White")
        assert result is None
