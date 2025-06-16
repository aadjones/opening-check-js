"""
This module provides utility functions for chess analysis.
"""

import os
from typing import Optional

from logging_config import setup_logging

import chess.pgn


logger = setup_logging(__name__)


def get_player_color(recent_game: chess.pgn.Game, player_name: str) -> str:
    """
    Determines the color the player was playing as in a given game.

    :param recent_game: chess.pgn.Game, the game to check
    :param player_name: str, the name or identifier of the player
    :return: 'White' if the player was White, 'Black' if the player was Black, or None if no match
    """
    white_player = recent_game.headers["White"]
    black_player = recent_game.headers["Black"]

    logger.debug(
        f"[get_player_color] player_name: '{player_name}' | White: '{white_player}' | Black: '{black_player}'"
    )
    if player_name.strip().lower() == white_player.strip().lower():
        logger.debug("[get_player_color] Matched as White")
        return "White"
    if player_name.strip().lower() == black_player.strip().lower():
        logger.debug("[get_player_color] Matched as Black")
        return "Black"
    logger.debug(f"[get_player_color] No match for player_name: '{player_name}'")
    # Else:
    raise Exception(f"Could not find match {player_name} to the game!")


def write_pgn(pgn_data: str, filename: str) -> None:
    """
    Writes the PGN data to a file.

    :param pgn_data: str, the PGN data to be written to the file
    :param filename: str, the name of the file to write the PGN data to
    :return: None
    """
    full_path = os.path.join(os.getcwd(), filename)

    # Open the file in write mode (wb for binary) and write the PGN data
    with open(full_path, "wb") as f:
        f.write(pgn_data.encode())  # Convert string to bytes

    # Log confirmation message
    logger.info(f"PGN data successfully saved to: {full_path}")


def read_pgn(pgn_file_path: str) -> Optional[chess.pgn.Game]:
    """
    Reads a PGN file and returns the corresponding chess game object.

    :param pgn_file_path: str, the path to the PGN file
    :return: chess.pgn.Game, the chess game object read from the PGN file, or None if no game found
    """
    with open(pgn_file_path, "r", encoding="utf-8") as pgn_file:
        return chess.pgn.read_game(pgn_file)
