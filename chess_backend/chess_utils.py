"""
This module provides utility functions for chess analysis.
"""

import io
import os
from typing import Optional

import chess
import chess.pgn

from logging_config import setup_logging

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

    logger.debug(f"[get_player_color] player_name: '{player_name}' | White: '{white_player}' | Black: '{black_player}'")
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


def calculate_previous_position_fen(pgn_string: Optional[str], move_number: int, color: str) -> Optional[str]:
    """
    Calculate the FEN position one move before the deviation occurred.

    Args:
        pgn_string: The full PGN of the game (can be None)
        move_number: The move number where deviation occurred (1-based)
        color: The color of the player ('white' or 'black')

    Returns:
        FEN string of the position before the deviation, or None if calculation fails
    """
    if not pgn_string:
        return None

    # Normalize color
    normalized_color = color.lower() if color else ""
    is_white = normalized_color.startswith("w")

    # Special case: White's first move has no previous position
    if move_number == 1 and is_white:
        return None

    try:
        # Parse the PGN
        pgn_io = io.StringIO(pgn_string)
        game = chess.pgn.read_game(pgn_io)
        if not game:
            return None

        # Create a board and play through the moves
        board = game.board()
        moves = list(game.mainline_moves())

        # Calculate target move index (0-based index of the deviating move)
        # For white moves: move index = (move_number - 1) * 2
        # For black moves: move index = (move_number - 1) * 2 + 1
        deviation_move_index = (move_number - 1) * 2 + (0 if is_white else 1)

        # If this is Black's first move, return starting position
        if deviation_move_index == 1:
            return chess.STARTING_FEN

        # Play moves up to (but not including) the opponent's last move
        # For animation, we want to show the opponent's last move being played
        # So we need the position before the opponent's move (2 ply back from deviation)
        moves_to_play = deviation_move_index - 1
        for i in range(min(moves_to_play, len(moves))):
            board.push(moves[i])

        return board.fen()

    except Exception as e:
        print(f"Error calculating previous position: {e}")
        return None
