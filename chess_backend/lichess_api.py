"""
This module handles requests to the Lichess API to get the last games from a username
and get study data from a Lichess study.
"""

import dataclasses
import logging
import re
from datetime import datetime
from typing import Optional, List, Dict, Any

import chess.pgn
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

import pgn_utils

LOG = logging.getLogger(__name__)


@dataclasses.dataclass
class Study:
    chapters: list[chess.pgn.Game]

    @staticmethod
    def fetch_id(study_id: str) -> "Study":
        url = f"https://lichess.org/api/study/{study_id}.pgn"
        response: requests.Response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch study. Status code: {response.status_code}")
        return Study(chapters=pgn_utils.pgn_to_pgn_list(response.text))

    @staticmethod
    def fetch_url(url: str) -> "Study":
        LOG.info(f"Fetching study from {url}...")
        study = Study.fetch_id(_extract_study_id_from_url(url))
        LOG.info("done")
        return study
    
def get_last_game_ids(username: str, max_games: int, since: Optional[datetime] = None) -> List[str]:
    """Fetches a list of the most recent game IDs for a user."""
    LOG.info("Fetching last %s game IDs for %s", max_games, username)
    try:
        params = {"max": max_games, "rated": "true"}
        if since:
            params["since"] = int(since.timestamp() * 1000)
            
        response = requests.get(
            f"https://lichess.org/api/games/user/{username}",
            params=params,
            headers={"Accept": "application/x-ndjson"} # We ask for NDJSON to get IDs
        )
        response.raise_for_status()
        
        # Parse the NDJSON response to extract just the game IDs
        games = response.text.strip().split('\n')
        game_ids = [requests.compat.json.loads(game).get('id') for game in games]
        return [gid for gid in game_ids if gid] # Filter out any potential nulls
        
    except requests.exceptions.RequestException as e:
        LOG.error(f"Failed to fetch game IDs for {username}: {e}")
        return []

def get_game_data_by_id(game_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches the full PGN and metadata for a single game, ensuring the opening name is included.
    """
    LOG.info("Fetching game data for ID: %s", game_id)
    try:
        params = {
            "pgnInJson": "true", # Get PGN inside a JSON object
            "tags": "true",
            "opening": "true" # <-- THE KEY PARAMETER
        }
        response = requests.get(
            f"https://lichess.org/game/export/{game_id}",
            params=params,
            headers={"Accept": "application/json"}
        )
        response.raise_for_status()
        return response.json() # Returns a JSON object with a 'pgn' key and other metadata
    except requests.exceptions.RequestException as e:
        LOG.error(f"Failed to fetch game data for {game_id}: {e}")
        return None

def _extract_study_id_from_url(url: str) -> str:
    """
    Extracts the study ID from a Lichess study URL.

    :param url: str, the URL of the Lichess study
    :return: str, the study ID extracted from the URL, or an empty string if not found
    """
    # Use a regex pattern to match the study ID in the URL
    pattern = re.compile(r"lichess\.org/study/([a-zA-Z0-9]+)")
    match = pattern.search(url)

    if match:
        # The study ID is captured in the first group of the match
        return match.group(1)

    # Return an empty string or a specific message if the URL doesn't match the expected format
    return "Study ID not found"
