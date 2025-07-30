# tests/test_analysis_service.py
"""Integration tests for analysis_service.py to ensure end-of-book scenarios are handled correctly."""

from unittest.mock import patch

import pytest

from analysis_service import perform_game_analysis
from deviation_result import DeviationResult


class MockStudy:
    """Mock Study class for testing."""

    def __init__(self, chapters):
        self.chapters = chapters

    @classmethod
    def fetch_url(cls, url: str):
        """Mock study fetching with predefined chapters."""
        if "white" in url.lower():
            # White repertoire: 1. e4 e5 2. Nf3
            from pgn_utils import pgn_string_to_game

            white_pgn = """[Event "White Repertoire"]

1. e4 e5 2. Nf3 *"""
            return cls([pgn_string_to_game(white_pgn)])
        else:
            # Black repertoire: 1... c5 2... d6
            from pgn_utils import pgn_string_to_game

            black_pgn = """[Event "Black Repertoire"]
[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"]

1... c5 2. Nf3 d6 *"""
            return cls([pgn_string_to_game(black_pgn)])


@pytest.fixture
def mock_dependencies():
    """Mock external dependencies for analysis service."""
    with (
        patch("analysis_service.get_last_game_ids") as mock_game_ids,
        patch("analysis_service.get_game_data_by_id") as mock_game_data,
        patch("analysis_service.lichess_api.Study", MockStudy),
        patch("analysis_service.insert_deviation_to_db") as mock_insert_db,
    ):

        yield {"game_ids": mock_game_ids, "game_data": mock_game_data, "insert_db": mock_insert_db}


def test_analysis_service_end_of_book_no_insertion(mock_dependencies):
    """Test that games continuing beyond prep don't get inserted into database."""
    # Setup mock data
    mock_dependencies["game_ids"].return_value = ["game123"]

    # Game that follows prep then continues beyond it
    game_data = {
        "pgn": """[Event "Test Game"]
[White "testuser"]
[Black "opponent"]

1. e4 e5 2. Nf3 Nc6 3. d4 exd4""",  # Continues beyond our prep (1. e4 e5 2. Nf3)
        "opening": {"name": "Italian Game"},
    }
    mock_dependencies["game_data"].return_value = game_data

    # Run analysis
    results = perform_game_analysis(
        username="testuser",
        user_id="user123",
        study_url_white="https://lichess.org/study/white",
        study_url_black="https://lichess.org/study/black",
        max_games=1,
    )

    # Should have one result with no deviation (None)
    assert len(results) == 1
    deviation_result, pgn = results[0]
    assert deviation_result is None

    # Database insertion should NOT have been called
    mock_dependencies["insert_db"].assert_not_called()


def test_analysis_service_true_deviation_gets_inserted(mock_dependencies):
    """Test that true deviations (when alternatives exist) get inserted into database."""
    # Setup mock data
    mock_dependencies["game_ids"].return_value = ["game456"]

    # Game with a real deviation - plays 1... c5 instead of prepared 1... e5
    game_data = {
        "pgn": """[Event "Test Game"]
[White "testuser"]
[Black "opponent"]

1. e4 c5""",  # Opponent deviates from our prep (we expected 1... e5)
        "opening": {"name": "Sicilian Defence"},
    }
    mock_dependencies["game_data"].return_value = game_data

    # Run analysis
    results = perform_game_analysis(
        username="testuser",
        user_id="user123",
        study_url_white="https://lichess.org/study/white",
        study_url_black="https://lichess.org/study/black",
        max_games=1,
    )

    # Should have one result with a deviation
    assert len(results) == 1
    deviation_result, pgn = results[0]
    assert isinstance(deviation_result, DeviationResult)
    assert deviation_result.first_deviator == "opponent"
    assert deviation_result.deviation_san == "c5"
    assert deviation_result.reference_san == "e5"
    assert "End of book" not in deviation_result.reference_san

    # Database insertion SHOULD have been called
    mock_dependencies["insert_db"].assert_called_once()


def test_analysis_service_validation_prevents_end_of_book_insertion(mock_dependencies):
    """Test that the analysis service validation layer prevents any End of book insertions."""
    # Setup mock data
    mock_dependencies["game_ids"].return_value = ["game789"]

    # This shouldn't happen with our fixed logic, but test the safety net
    game_data = {
        "pgn": """[Event "Test Game"]
[White "testuser"]
[Black "opponent"]

1. e4 e5 2. Nf3 Nc6""",
        "opening": {"name": "Italian Game"},
    }
    mock_dependencies["game_data"].return_value = game_data

    # Mock a hypothetical DeviationResult with "End of book" (this shouldn't happen with fixed logic)
    mock_deviation = DeviationResult(
        first_deviator="user",
        move_number=3,
        deviation_san="d4",
        reference_san="End of book",  # This is what we're testing against
        player_color="White",
        board_fen="rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    )

    # Patch the trie to return this mock deviation (simulating old buggy behavior)
    with patch("repertoire_trie.RepertoireTrie.find_deviation", return_value=mock_deviation):
        results = perform_game_analysis(
            username="testuser",
            user_id="user123",
            study_url_white="https://lichess.org/study/white",
            study_url_black="https://lichess.org/study/black",
            max_games=1,
        )

    # Should have one result, but deviation should be filtered out
    assert len(results) == 1
    deviation_result, pgn = results[0]
    # The deviation should still be in the results (for backwards compatibility)
    # but database insertion should be prevented
    assert isinstance(deviation_result, DeviationResult)

    # Database insertion should NOT have been called due to validation
    mock_dependencies["insert_db"].assert_not_called()


def test_analysis_service_multiple_games_mixed_scenarios(mock_dependencies):
    """Test analysis with multiple games having different deviation scenarios."""
    # Setup mock data for multiple games
    mock_dependencies["game_ids"].return_value = ["game1", "game2", "game3"]

    # Game 1: End of book scenario (no deviation)
    # Game 2: True deviation
    # Game 3: No deviation (follows prep exactly)
    game_data_responses = [
        {
            "pgn": """[Event "Game 1"]
[White "testuser"]
[Black "opponent1"]

1. e4 e5 2. Nf3 Nc6 3. d4""",  # Continues beyond prep
            "opening": {"name": "Scotch Game"},
        },
        {
            "pgn": """[Event "Game 2"]
[White "testuser"]
[Black "opponent2"]

1. e4 c5""",  # True deviation
            "opening": {"name": "Sicilian Defence"},
        },
        {
            "pgn": """[Event "Game 3"]
[White "testuser"]
[Black "opponent3"]

1. e4 e5 2. Nf3""",  # Follows prep exactly
            "opening": {"name": "Italian Game"},
        },
    ]

    mock_dependencies["game_data"].side_effect = game_data_responses

    # Run analysis
    results = perform_game_analysis(
        username="testuser",
        user_id="user123",
        study_url_white="https://lichess.org/study/white",
        study_url_black="https://lichess.org/study/black",
        max_games=3,
    )

    # Should have three results
    assert len(results) == 3

    # Game 1: End of book - no deviation
    deviation1, pgn1 = results[0]
    assert deviation1 is None

    # Game 2: True deviation
    deviation2, pgn2 = results[1]
    assert isinstance(deviation2, DeviationResult)
    assert deviation2.deviation_san == "c5"
    assert "End of book" not in deviation2.reference_san

    # Game 3: No deviation (follows prep)
    deviation3, pgn3 = results[2]
    assert deviation3 is None

    # Database insertion should only be called once (for game 2)
    assert mock_dependencies["insert_db"].call_count == 1


def test_analysis_service_error_handling_with_invalid_pgn(mock_dependencies):
    """Test that the analysis service handles errors gracefully."""
    # Setup mock data
    mock_dependencies["game_ids"].return_value = ["invalid_game"]

    # Invalid game data
    mock_dependencies["game_data"].return_value = {"pgn": "invalid pgn format", "opening": {"name": "Unknown"}}

    # Run analysis - should not crash
    results = perform_game_analysis(
        username="testuser",
        user_id="user123",
        study_url_white="https://lichess.org/study/white",
        study_url_black="https://lichess.org/study/black",
        max_games=1,
    )

    # Should handle the error gracefully
    assert len(results) == 1
    deviation_result, pgn = results[0]
    assert deviation_result is None  # Error should result in None deviation

    # Database insertion should not be called
    mock_dependencies["insert_db"].assert_not_called()


def test_analysis_service_security_no_code_injection(mock_dependencies):
    """Test that the analysis service handles potentially malicious input safely."""
    # Setup mock data with potentially malicious content
    mock_dependencies["game_ids"].return_value = ["malicious_game"]

    # Game data with potentially problematic content
    game_data = {
        "pgn": """[Event "'; DROP TABLE opening_deviations; --"]
[White "testuser"; DELETE FROM users; --"]
[Black "opponent"]

1. e4 e5 2. Nf3""",
        "opening": {"name": '<script>alert("xss")</script>'},
    }
    mock_dependencies["game_data"].return_value = game_data

    # Run analysis - should handle malicious input safely
    results = perform_game_analysis(
        username="testuser",
        user_id="user123",
        study_url_white="https://lichess.org/study/white",
        study_url_black="https://lichess.org/study/black",
        max_games=1,
    )

    # Should process normally (the content gets validated by the chess library)
    assert len(results) == 1
    deviation_result, pgn = results[0]
    # Should be None since the game follows our prep exactly
    assert deviation_result is None

    # No database insertion for this case
    mock_dependencies["insert_db"].assert_not_called()
