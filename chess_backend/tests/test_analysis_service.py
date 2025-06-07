# tests/test_analysis_service.py
import os
import sys
from typing import Any

# Add the parent directory to the path so we can import modules directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the actual lichess_api module to construct mock return values if needed (like Study)
import lichess_api as actual_lichess_api_module  # noqa: E402
import pgn_utils  # noqa: E402
from analysis_service import perform_game_analysis  # noqa: E402
from deviation_result import DeviationResult  # noqa: E402

# --- Standardized Usernames ---
USER_AS_WHITE = "TestUserWhite"
USER_AS_BLACK = "TestUserBlack"
OPPONENT = "OpponentPlayer"


# --- Helper to create PGNs with consistent headers ---
def create_pgn_string(moves: str, white_player: str, black_player: str, event: str = "Test Game") -> str:
    return f'[Event "{event}"]\n[White "{white_player}"]\n[Black "{black_player}"]\n{moves} *'


# --- Qualitative Test Ideas ---


def test_perform_analysis_no_deviation_user_as_white(mocker: Any) -> None:
    """
    User is WHITE. Game matches repertoire. No deviation expected.
    """
    repertoire_pgn_white = create_pgn_string("1. e4 e5 2. Nf3 Nc6", "Repertoire", "Repertoire")
    recent_game_pgn = create_pgn_string("1. e4 e5 2. Nf3 Nc6 3. Bb5", USER_AS_WHITE, OPPONENT)

    # Corrected mock paths: Patch where the function is looked up in analysis_service
    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn)

    mock_study_object = actual_lichess_api_module.Study(chapters=[pgn_utils.pgn_string_to_game(repertoire_pgn_white)])
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", return_value=mock_study_object)

    results_with_pgn = perform_game_analysis(
        username=USER_AS_WHITE,
        study_url_white="http://example.com/white_rep",
        study_url_black="http://example.com/black_rep",
        max_games=1,
    )

    assert len(results_with_pgn) == 1, "Should analyze one game"
    deviation_result, _ = results_with_pgn[0]
    assert deviation_result is None, "Expected no deviation when game matches white repertoire"


def test_perform_analysis_no_deviation_user_as_black(mocker: Any) -> None:
    """
    User is BLACK. Game matches repertoire. No deviation expected.
    """
    repertoire_pgn_black = create_pgn_string("1. d4 Nf6 2. c4 g6", "Repertoire", "Repertoire")
    recent_game_pgn = create_pgn_string("1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", OPPONENT, USER_AS_BLACK)

    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn)

    mock_study_object = actual_lichess_api_module.Study(chapters=[pgn_utils.pgn_string_to_game(repertoire_pgn_black)])
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", return_value=mock_study_object)

    results_with_pgn = perform_game_analysis(
        username=USER_AS_BLACK,
        study_url_white="http://example.com/white_rep",
        study_url_black="http://example.com/black_rep",
        max_games=1,
    )
    assert len(results_with_pgn) == 1
    deviation_result, _ = results_with_pgn[0]
    assert deviation_result is None, "Expected no deviation when game matches black repertoire"


def test_perform_analysis_deviation_found_user_as_white(mocker: Any) -> None:
    """
    User is WHITE. Game deviates from repertoire. Deviation expected.
    """
    repertoire_pgn_white = create_pgn_string("1. e4 e5", "Repertoire", "Repertoire")
    recent_game_pgn_deviation = create_pgn_string("1. d4 e5", USER_AS_WHITE, OPPONENT)

    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn_deviation)
    mocker.patch("analysis_service.insert_deviation_to_db", return_value=None)

    mock_study_object = actual_lichess_api_module.Study(chapters=[pgn_utils.pgn_string_to_game(repertoire_pgn_white)])
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", return_value=mock_study_object)

    results_with_pgn = perform_game_analysis(
        username=USER_AS_WHITE,
        study_url_white="http://example.com/white_rep",
        study_url_black="http://example.com/black_rep",
        max_games=1,
    )
    assert len(results_with_pgn) == 1
    deviation_result, _ = results_with_pgn[0]
    assert isinstance(deviation_result, DeviationResult), "Expected a DeviationResult object for white"
    assert deviation_result.player_color == "White", "Deviating player should be White"
    assert deviation_result.move_number == 1, "Deviation should be on move 1"
    assert deviation_result.deviation_san == "d4", "Expected deviation SAN to be d4"
    assert deviation_result.reference_san == "e4", "Expected reference SAN to be e4"


def test_perform_analysis_deviation_found_user_as_black(mocker: Any) -> None:
    """
    User is BLACK. Game deviates from repertoire. Deviation expected.
    """
    repertoire_pgn_black = create_pgn_string("1. e4 c5", "Repertoire", "Repertoire")
    recent_game_pgn_deviation = create_pgn_string("1. e4 e5", OPPONENT, USER_AS_BLACK)

    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn_deviation)
    mocker.patch("analysis_service.insert_deviation_to_db", return_value=None)

    mock_study_object = actual_lichess_api_module.Study(chapters=[pgn_utils.pgn_string_to_game(repertoire_pgn_black)])
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", return_value=mock_study_object)

    results_with_pgn = perform_game_analysis(
        username=USER_AS_BLACK,
        study_url_white="http://example.com/white_rep",
        study_url_black="http://example.com/black_rep",
        max_games=1,
    )
    assert len(results_with_pgn) == 1
    deviation_result, _ = results_with_pgn[0]
    assert isinstance(deviation_result, DeviationResult), "Expected a DeviationResult object for black"
    assert deviation_result.player_color == "Black", "Deviating player should be Black"
    assert deviation_result.move_number == 1, "Deviation should be on move 1 for Black"
    assert deviation_result.deviation_san == "e5", "Expected deviation SAN to be e5"
    assert deviation_result.reference_san == "c5", "Expected reference SAN to be c5"


def test_perform_analysis_opponent_deviates_user_as_white(mocker: Any) -> None:
    """
    User is WHITE. Opponent deviates. No deviation for user expected.
    """
    repertoire_pgn_white = create_pgn_string("1. e4 e5 2. Nf3", "Repertoire", "Repertoire")
    recent_game_pgn_opponent_deviates = create_pgn_string("1. e4 c5", USER_AS_WHITE, OPPONENT)

    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn_opponent_deviates)

    mock_study_object = actual_lichess_api_module.Study(chapters=[pgn_utils.pgn_string_to_game(repertoire_pgn_white)])
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", return_value=mock_study_object)

    results_with_pgn = perform_game_analysis(
        username=USER_AS_WHITE,
        study_url_white="http://example.com/white_rep",
        study_url_black="http://example.com/black_rep",
        max_games=1,
    )
    assert len(results_with_pgn) == 1
    deviation_result, _ = results_with_pgn[0]
    assert deviation_result is None, "Expected no deviation for user if opponent deviates first"


def test_perform_analysis_api_call_fails_gracefully(mocker: Any) -> None:
    """
    Test that if get_last_games_pgn returns None (simulating an API failure),
    the analysis returns an empty list.
    """
    mocker.patch("analysis_service.get_last_games_pgn", return_value=None)
    # No need to mock Study.fetch_url if the first call already "fails"

    results_with_pgn = perform_game_analysis(
        username="testuser",
        study_url_white="http://example.com/white",
        study_url_black="http://example.com/black",
        max_games=1,
    )
    assert results_with_pgn == [], "Expected empty list when fetching games fails"


def test_perform_analysis_study_fetch_fails_gracefully(mocker: Any) -> None:
    """
    Test that if Study.fetch_url raises an exception,
    the analysis returns an empty list.
    """
    recent_game_pgn = create_pgn_string("1. e4 e5", USER_AS_WHITE, OPPONENT)
    mocker.patch("analysis_service.get_last_games_pgn", return_value=recent_game_pgn)
    mocker.patch("analysis_service.lichess_api.Study.fetch_url", side_effect=Exception("Simulated fetch failure"))

    results_with_pgn = perform_game_analysis(
        username=USER_AS_WHITE,
        study_url_white="http://example.com/white",
        study_url_black="http://example.com/black",
        max_games=1,
    )
    assert results_with_pgn == [], "Expected empty list when fetching studies fails"
