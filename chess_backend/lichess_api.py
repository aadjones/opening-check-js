"""
This module handles requests to the Lichess API to get the last games from a username
and get study data from a Lichess study.
"""

import dataclasses
import logging
import re
from typing import Optional

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
            raise Exception("Failed to fetch study. Status code: {response.status_code}")
        return Study(chapters=pgn_utils.pgn_to_pgn_list(response.text))

    @staticmethod
    def fetch_url(url: str) -> "Study":
        LOG.info(f"Fetching study from {url}...")
        study = Study.fetch_id(_extract_study_id_from_url(url))
        LOG.info("done")
        return study


def get_last_games_pgn(
    username: str,
    max_games: int = 1,
    retries: int = 3,
    backoff_factor: float = 1.5,
    timeout: int = 10,
) -> Optional[str]:
    """
    Fetches the PGN of the last several games played by a Lichess username with retry and timeout.

    :param username: str, the Lichess username of the player
    :param max_games: int, the maximum number of games to retrieve (default is 1)
    :param retries: int, the number of retries in case of failures (default is 3)
    :param backoff_factor: float, the backoff factor for retrying requests (default is 1.5)
    :param timeout: int, the timeout for each HTTP request in seconds (default is 10)
    :return: Optional[str], the PGN of the last game(s) played by the user, or None if failed
    """
    session = requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=(500, 502, 504),
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    LOG.info("Fetching %s games for %s", max_games, username)

    try:
        response = session.get(
            f"https://lichess.org/api/games/user/{username}",
            params={"max": max_games},
            timeout=timeout,
        )
        # Will raise an HTTPError if the HTTP request returned an unsuccessful status code
        response.raise_for_status()
        LOG.info("Fetch done")
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
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
