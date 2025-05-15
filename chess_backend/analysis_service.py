from typing import Optional, List, Tuple

# Use relative imports from the chess_backend package
from . import lichess_api
from . import pgn_utils
from .lichess_api import get_last_games_pgn
from .chess_utils import find_deviation_in_entire_study_white_and_black
from .deviation_result import DeviationResult

# We're removing the Streamlit logger for now.
# You can add standard Python logging later if you want.
# LOG = logger.get_logger(__name__)


def perform_game_analysis(
    username: str,
    study_url_white: str,
    study_url_black: str,
    max_games: int,
) -> List[Tuple[Optional[DeviationResult], str]]: # <--- CORRECTED TYPE HINT
    """
    Handles the core logic of fetching games, studies, and finding deviations.
    Returns a list of tuples, where each tuple is (DeviationResult or None, pgn_string_of_game).
    """
    print(f"Starting analysis for user: {username}, max_games: {max_games}")

    test_game_str = get_last_games_pgn(username, max_games)
    if test_game_str is None:
        print(f"Error fetching games for user {username}!")
        return []

    try:
        test_game_list = pgn_utils.pgn_to_pgn_list(test_game_str)
        white_study = lichess_api.Study.fetch_url(str(study_url_white))
        black_study = lichess_api.Study.fetch_url(str(study_url_black))
    except Exception as e:
        print(f"Error processing PGNs or fetching studies: {e}")
        return []

    # This list will hold tuples of (DeviationResult or None, pgn_string)
    results_with_pgn: List[Tuple[Optional[DeviationResult], str]] = [] # <--- CORRECTED LIST NAME AND TYPE

    for game_obj in test_game_list: # game_obj is a chess.pgn.Game object
        pgn_string = str(game_obj) # Get the PGN string for this game
        deviation_info: Optional[DeviationResult] = None # Default to None

        try:
            deviation_info = find_deviation_in_entire_study_white_and_black(
                white_study, black_study, game_obj, username
            )
            # Always append a tuple, deviation_info will be None if no deviation found
            results_with_pgn.append((deviation_info, pgn_string))
        except Exception as e:
            print(f"Error analyzing one of the games for {username}: {e}")
            # If an exception occurs during analysis, append a tuple with None for deviation
            results_with_pgn.append((None, pgn_string))

    found_count = len([d for d, pgn in results_with_pgn if d is not None]) # Adjusted for tuple
    print(f"Analysis complete for {username}. Found {found_count} deviations in {len(results_with_pgn)} games.")
    return results_with_pgn # <--- Return the list of tuples
