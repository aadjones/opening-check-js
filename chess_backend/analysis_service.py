from typing import List, Optional, Tuple

# Use local imports since we're running from within the chess_backend directory
import lichess_api
import pgn_utils
from chess_utils import find_deviation_in_entire_study_white_and_black
from deviation_result import DeviationResult
from lichess_api import get_last_games_pgn
from supabase_client import insert_deviation_to_db

# We're removing the Streamlit logger for now.
# You can add standard Python logging later if you want.
# LOG = logger.get_logger(__name__)

"""
Chess Game Analysis Service

This module runs on the server and handles the core game analysis logic.
It coordinates fetching games from Lichess, comparing them against studies,
and finding deviations.

🏗️ Analysis Process:
1. Fetch recent games from Lichess API
2. Fetch opening studies (white/black)
3. Compare each game against studies
4. Find deviations and store results
5. Return analysis results to API

🔄 Data Flow:
Lichess API -> Game PGNs
            -> Study PGNs
            -> Analysis
            -> Supabase DB

🔧 Dependencies:
- lichess_api: Fetches games and studies
- chess_utils: Core deviation finding logic
- supabase_client: Stores results
"""


def perform_game_analysis(
    username: str,
    study_url_white: str,
    study_url_black: str,
    max_games: int,
) -> List[Tuple[Optional[DeviationResult], str]]:
    """
    Handles the core logic of fetching games, studies, and finding deviations.
    Returns a list of tuples (DeviationResult or None, pgn_string) for each game.
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
    results: List[Tuple[Optional[DeviationResult], str]] = []

    for game_obj in test_game_list:  # game_obj is a chess.pgn.Game object
        deviation_info: Optional[DeviationResult] = None  # Default to None
        pgn_string = str(game_obj)  # Get the PGN string for this game

        try:
            deviation_info = find_deviation_in_entire_study_white_and_black(
                white_study, black_study, game_obj, username
            )
            # If we found a deviation, add the PGN to it
            if deviation_info:
                deviation_info.pgn = pgn_string
                # Insert into DB
                insert_deviation_to_db(deviation_info, pgn_string, username)
            # Always append a tuple of (deviation result or None, pgn_string)
            results.append((deviation_info, pgn_string))
        except Exception as e:
            print(f"Error analyzing one of the games for {username}: {e}")
            # If an exception occurs during analysis, append tuple with None
            results.append((None, pgn_string))

    found_count = len([d for d, _ in results if d is not None])
    print(f"Analysis complete for {username}. Found {found_count} deviations in {len(results)} games.")
    return results
