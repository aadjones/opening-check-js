from typing import Optional, List

# These are your existing project files, assuming they are in the same directory
# or your Python path is set up.
# For FastAPI, if these files are in the same directory as analysis_service.py and main.py,
# these imports should work.
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
    This version returns the data instead of displaying it with Streamlit.

    :param username: str, the Lichess username
    :param study_url_white: str, the URL of the White Lichess study
    :param study_url_black: str, the URL of the Black Lichess study
    :param max_games: int, the number of games to look at the user's history
    :return: List[Optional[DeviationResult]], a list of deviation results or None
    """
    print(f"Starting analysis for user: {username}, max_games: {max_games}") # Simple print for now

    test_game_str = get_last_games_pgn(username, max_games)

    if test_game_str is None:
        print(f"Error fetching games for user {username}!")
        # In an API, you might want to raise an exception here
        # that FastAPI can turn into an HTTP error.
        # For now, returning an empty list.
        return []

    try:
        test_game_list = pgn_utils.pgn_to_pgn_list(test_game_str)
        # Ensure study URLs are strings for fetch_url if they come from Pydantic models later
        white_study = lichess_api.Study.fetch_url(str(study_url_white))
        black_study = lichess_api.Study.fetch_url(str(study_url_black))
    except Exception as e:
        print(f"Error processing PGNs or fetching studies: {e}")
        # Again, consider raising a specific exception
        return []

    info_list: List[Optional[DeviationResult]] = []
    for game in test_game_list:
        try:
            deviation_info = find_deviation_in_entire_study_white_and_black(
                white_study, black_study, game, username
            )
            info_list.append(deviation_info)
        except Exception as e:
            # Log error for this specific game and continue if possible
            print(f"Error analyzing one of the games for {username}: {e}")
            info_list.append(None) # Or handle as appropriate

    found_count = len([d for d in info_list if d is not None])
    print(f"Analysis complete for {username}. Found {found_count} deviations in {len(info_list)} games.")
    return info_list