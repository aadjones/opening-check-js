import time
from datetime import datetime
from typing import List, Optional, Tuple

# Use local imports since we're running from within the chess_backend directory
import lichess_api
import pgn_utils
from chess_utils import get_player_color
from deviation_result import DeviationResult
from lichess_api import get_game_data_by_id, get_last_game_ids  # Use the new functions
from logging_config import setup_logging
from repertoire_trie import RepertoireTrie
from supabase_client import insert_deviation_to_db

# Configure logging
logger = setup_logging(__name__)

# Feature flags (mirrored from frontend featureFlags.ts)
ENABLE_LICHESS_STUDY_THROTTLE = True
LICHESS_THROTTLE_DELAY_SECONDS = 1

"""
Chess Game Analysis Service

This module runs on the server and handles the core game analysis logic.
It coordinates fetching games from Lichess, comparing them against studies,
and finding deviations.

🏗️ Analysis Process:
1. Fetch recent game IDs from Lichess API
2. For each game ID, fetch its full data (PGN, opening name, etc.)
3. Fetch opening studies (white/black) and build Tries
4. Compare each game against the appropriate Trie
5. Find deviations and store results
6. Return analysis results to API
"""


def perform_game_analysis(
    username: str,
    user_id: str,
    study_url_white: str,
    study_url_black: str,
    max_games: int = 10,
    since: Optional[datetime] = None,
) -> List[Tuple[Optional[DeviationResult], str]]:
    """
    Handles the core logic of fetching games, studies, and finding deviations
    using the new, more reliable game export strategy.
    """
    try:
        logger.info(f"Starting analysis for user: {username} (UUID: {user_id}) with Game Export strategy.")

        # --- Part 1: Fetch Game IDs ---
        game_ids = get_last_game_ids(username, max_games, since)
        if not game_ids:
            logger.warning(f"No game IDs found for user {username} in the given timeframe.")
            return []
        logger.info(f"Found {len(game_ids)} game IDs to analyze.")

        # --- Part 2: Build the Repertoire Tries ---
        logger.info("Building White and Black repertoire tries...")
        try:
            # Build White Trie
            if ENABLE_LICHESS_STUDY_THROTTLE:
                logger.info(
                    f"[THROTTLE] Sleeping {LICHESS_THROTTLE_DELAY_SECONDS}s before fetching white study due to feature flag."
                )
                time.sleep(LICHESS_THROTTLE_DELAY_SECONDS)
            white_study = lichess_api.Study.fetch_url(str(study_url_white))
            white_trie = RepertoireTrie()
            for chapter in white_study.chapters:
                white_trie.add_study_chapter(chapter)
            logger.info(f"White trie built. Root has {len(white_trie.root.children)} starting moves.")
            # Debug: print root moves (UCI and SAN)
            root_moves = [(uci, node.san) for uci, node in white_trie.root.children.items()]
            logger.info(f"[DEBUG] White trie root moves (UCI, SAN): {root_moves}")

            # Build Black Trie
            if ENABLE_LICHESS_STUDY_THROTTLE:
                logger.info(
                    f"[THROTTLE] Sleeping {LICHESS_THROTTLE_DELAY_SECONDS}s before fetching black study due to feature flag."
                )
                time.sleep(LICHESS_THROTTLE_DELAY_SECONDS)
            black_study = lichess_api.Study.fetch_url(str(study_url_black))
            black_trie = RepertoireTrie()
            for chapter in black_study.chapters:
                black_trie.add_study_chapter(chapter)
            logger.info(f"Black trie built. Root has {len(black_trie.root.children)} starting moves.")
        except Exception as e:
            logger.error(f"Error fetching studies or building tries: {e}")
            return []

        # --- Part 3: Analyze Each Game by ID ---
        results: List[Tuple[Optional[DeviationResult], str]] = []
        for game_id in game_ids:
            game_data = get_game_data_by_id(game_id)
            if not game_data or "pgn" not in game_data:
                logger.warning(f"Could not fetch PGN data for game ID {game_id}. Skipping.")
                continue

            pgn_string = game_data["pgn"]
            opening_name = game_data.get("opening", {}).get("name")

            try:
                game_obj = pgn_utils.pgn_string_to_game(pgn_string)
                deviation_info = None

                player_color = get_player_color(game_obj, username)

                if player_color == "White":
                    deviation_info = white_trie.find_deviation(game_obj, username)
                elif player_color == "Black":
                    deviation_info = black_trie.find_deviation(game_obj, username)
                else:
                    logger.warning(f"Could not determine color for {username} in game {game_id}. Skipping.")

                if deviation_info:
                    # Additional validation: Skip "End of book" scenarios that shouldn't have been flagged as deviations
                    if deviation_info.reference_san == "End of book":
                        logger.warning(
                            f"Skipping invalid 'End of book' deviation for game {game_id}. "
                            f"This should not occur with the fixed trie logic."
                        )
                        deviation_info = None  # Set to None instead of skipping the game
                    else:
                        deviation_dict = deviation_info.model_dump()
                        deviation_dict["opening_name"] = opening_name

                        # Determine which study URL to use based on player color
                        study_url = None
                        if player_color == "White":
                            study_url = study_url_white
                        elif player_color == "Black":
                            study_url = study_url_black

                        # Call the DB function with the dictionary, PGN string, user_id, and study URL
                        insert_deviation_to_db(deviation_dict, pgn_string, user_id, study_url)

                results.append((deviation_info, pgn_string))

            except Exception as e:
                logger.error(f"Error analyzing game {game_id} for {username}: {e}")
                results.append((None, pgn_string))

        found_count = len([d for d, _ in results if d is not None])
        logger.info(f"Analysis complete for {username}. Found {found_count} deviations in {len(results)} games.")
        return results

    except Exception as e:
        logger.error(f"Top-level game analysis failed: {e}", exc_info=True)
        return []
