# tests/test_analysis_service.py
import os
import sys

# Add the parent directory to the path so we can import modules directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pgn_utils  # noqa: E402
from chess_utils import find_deviation  # noqa: E402
from deviation_result import DeviationResult  # noqa: E402

# --- Standardized Usernames ---
USER_AS_WHITE = "TestUserWhite"
USER_AS_BLACK = "TestUserBlack"
OPPONENT = "OpponentPlayer"


# --- Helper to create PGNs with consistent headers ---
def create_pgn_string(moves: str, white_player: str, black_player: str, event: str = "Test Game") -> str:
    return f'[Event "{event}"]\n[White "{white_player}"]\n[Black "{black_player}"]\n{moves} *'


# --- Qualitative Test Ideas ---


def test_user_deviates_first_white() -> None:
    repertoire_pgn = create_pgn_string("1. e4 e5", "Repertoire", "Repertoire")
    game_pgn = create_pgn_string("1. d4 e5", USER_AS_WHITE, OPPONENT)
    repertoire_game = pgn_utils.pgn_string_to_game(repertoire_pgn)
    recent_game = pgn_utils.pgn_string_to_game(game_pgn)
    result = find_deviation(repertoire_game, recent_game, USER_AS_WHITE)
    assert isinstance(result, DeviationResult)
    assert result.first_deviator == "user"
    assert result.player_color == "White"
    assert result.deviation_san == "d4"
    assert result.reference_san == "e4"


def test_user_deviates_first_black() -> None:
    repertoire_pgn = create_pgn_string("1. e4 c5", "Repertoire", "Repertoire")
    game_pgn = create_pgn_string("1. e4 e5", OPPONENT, USER_AS_BLACK)
    repertoire_game = pgn_utils.pgn_string_to_game(repertoire_pgn)
    recent_game = pgn_utils.pgn_string_to_game(game_pgn)
    result = find_deviation(repertoire_game, recent_game, USER_AS_BLACK)
    assert isinstance(result, DeviationResult)
    assert result.first_deviator == "user"
    assert result.player_color == "Black"
    assert result.deviation_san == "e5"
    assert result.reference_san == "c5"


def test_opponent_deviates_first_white() -> None:
    repertoire_pgn = create_pgn_string("1. e4 e5 2. Nf3", "Repertoire", "Repertoire")
    game_pgn = create_pgn_string("1. e4 c5", USER_AS_WHITE, OPPONENT)
    repertoire_game = pgn_utils.pgn_string_to_game(repertoire_pgn)
    recent_game = pgn_utils.pgn_string_to_game(game_pgn)
    result = find_deviation(repertoire_game, recent_game, USER_AS_WHITE)
    assert isinstance(result, DeviationResult)
    assert result.first_deviator == "opponent"
    assert result.player_color == "Black"
    assert result.deviation_san == "c5"
    assert result.reference_san == "e5"


def test_no_deviation_white() -> None:
    repertoire_pgn = create_pgn_string("1. e4 e5 2. Nf3 Nc6", "Repertoire", "Repertoire")
    game_pgn = create_pgn_string("1. e4 e5 2. Nf3 Nc6", USER_AS_WHITE, OPPONENT)
    repertoire_game = pgn_utils.pgn_string_to_game(repertoire_pgn)
    recent_game = pgn_utils.pgn_string_to_game(game_pgn)
    result = find_deviation(repertoire_game, recent_game, USER_AS_WHITE)
    assert result is None


def test_no_deviation_black() -> None:
    repertoire_pgn = create_pgn_string("1. d4 Nf6 2. c4 g6", "Repertoire", "Repertoire")
    game_pgn = create_pgn_string("1. d4 Nf6 2. c4 g6", OPPONENT, USER_AS_BLACK)
    repertoire_game = pgn_utils.pgn_string_to_game(repertoire_pgn)
    recent_game = pgn_utils.pgn_string_to_game(game_pgn)
    result = find_deviation(repertoire_game, recent_game, USER_AS_BLACK)
    assert result is None
