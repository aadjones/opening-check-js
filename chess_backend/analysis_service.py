from datetime import datetime
from typing import List, Optional, Tuple

# Use local imports since we're running from within the chess_backend directory
import lichess_api
import pgn_utils
from chess_utils import get_player_color
from repertoire_trie import RepertoireTrie
from deviation_result import DeviationResult
from lichess_api import get_last_games_pgn
from logging_config import setup_logging
from supabase_client import insert_deviation_to_db

# Configure logging
logger = setup_logging(__name__)

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
    max_games: int = 10,
    since: Optional[datetime] = None,
) -> List[Tuple[Optional[DeviationResult], str]]:
    """
    Handles the core logic of fetching games, studies, and finding deviations
    using the new RepertoireTrie strategy.
    """
    try:
        logger.info(f"Starting analysis for user: {username} with Trie strategy.")

        # --- Part 1: Fetch Game Data (no changes here) ---
        test_game_str = get_last_games_pgn(username, max_games, since)
        if test_game_str is None:
            logger.warning(f"No games found or error fetching games for user {username}!")
            return []

        try:
            test_game_list = pgn_utils.pgn_to_pgn_list(test_game_str)
        except Exception as e:
            logger.error(f"Error processing game PGNs: {e}")
            return []

        # --- Part 2: Build the Repertoire Tries (NEW LOGIC) ---
        logger.info("Building White and Black repertoire tries...")
        try:
            # Build White Trie
            white_study = lichess_api.Study.fetch_url(str(study_url_white))
            white_trie = RepertoireTrie()
            for chapter in white_study.chapters:
                white_trie.add_study_chapter(chapter)
            logger.info(f"White trie built. Root has {len(white_trie.root.children)} starting moves.")

            # Build Black Trie
            black_study = lichess_api.Study.fetch_url(str(study_url_black))
            black_trie = RepertoireTrie()
            for chapter in black_study.chapters:
                black_trie.add_study_chapter(chapter)
            logger.info(f"Black trie built. Root has {len(black_trie.root.children)} starting moves.")

        except Exception as e:
            logger.error(f"Error fetching studies or building tries: {e}")
            # Depending on desired behavior, you could return or continue with empty tries
            return []
        
        # --- Part 3: Analyze Games Against the Tries (NEW LOGIC) ---
        results: List[Tuple[Optional[DeviationResult], str]] = []
        for game_obj in test_game_list:
            deviation_info = None
            pgn_string = str(game_obj)

            try:
                player_color = get_player_color(game_obj, username)
                
                # Select the correct trie based on the player's color for the game
                if player_color == "White":
                    deviation_info = white_trie.find_deviation(game_obj, username)
                elif player_color == "Black":
                    deviation_info = black_trie.find_deviation(game_obj, username)
                else:
                    logger.warning(f"Could not determine color for {username} in game. Skipping.")

                if deviation_info:
                    deviation_info.pgn = pgn_string
                    # Use .model_dump() to pass a dict to the db function for type safety
                    insert_deviation_to_db(deviation_info.model_dump(), pgn_string, username)
                
                results.append((deviation_info, pgn_string))
            except Exception as e:
                logger.error(f"Error analyzing one of the games for {username}: {e}")
                results.append((None, pgn_string))

        found_count = len([d for d, _ in results if d is not None])
        logger.info(f"Analysis complete for {username}. Found {found_count} deviations in {len(results)} games.")
        return results

    except Exception as e:
        logger.error(f"Game analysis failed: {e}")
        return []