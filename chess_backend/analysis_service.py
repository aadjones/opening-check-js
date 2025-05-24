from typing import Optional, List, Tuple

# Use absolute imports instead of relative imports
import lichess_api
import pgn_utils
from lichess_api import get_last_games_pgn
from chess_utils import find_deviation_in_entire_study_white_and_black
from deviation_result import DeviationResult

# We're removing the Streamlit logger for now.
# You can add standard Python logging later if you want.
# LOG = logger.get_logger(__name__)


def perform_game_analysis(
    username: str,
    study_url_white: str,
    study_url_black: str,
    max_games: int,
) -> List[Optional[DeviationResult]]:
    """
    Handles the core logic of fetching games, studies, and finding deviations.
    Returns a list of DeviationResult objects or None for each game.
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

    # This list will hold DeviationResult objects or None
    results: List[Optional[DeviationResult]] = []

    for game_obj in test_game_list: # game_obj is a chess.pgn.Game object
        deviation_info: Optional[DeviationResult] = None # Default to None
        pgn_string = str(game_obj) # Get the PGN string for this game

        try:
            deviation_info = find_deviation_in_entire_study_white_and_black(
                white_study, black_study, game_obj, username
            )
            # If we found a deviation, add the PGN to it
            if deviation_info:
                deviation_info.pgn = pgn_string
            # Always append the deviation result (or None if no deviation found)
            results.append(deviation_info)
        except Exception as e:
            print(f"Error analyzing one of the games for {username}: {e}")
            # If an exception occurs during analysis, append None
            results.append(None)

    found_count = len([d for d in results if d is not None])
    print(f"Analysis complete for {username}. Found {found_count} deviations in {len(results)} games.")
    return results
