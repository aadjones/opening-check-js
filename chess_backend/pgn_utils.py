"""
This module provides utility functions for pgn files.
"""

import io
from typing import Iterator, List

import chess
import chess.pgn

import logging_config

logger = logging_config.setup_logging(__name__)


def pgn_string_to_game(pgn_str: str) -> chess.pgn.Game:
    """
    Converts a PGN format string into a chess.pgn.Game object.

    :param pgn_str: str, the PGN format string of the game
    :return: chess.pgn.Game, the game object
    """
    pgn_io = io.StringIO(pgn_str)
    game = chess.pgn.read_game(pgn_io)
    if game is None:
        raise Exception(f"Could not read game from PGN: {pgn_str}")
    return game


def pgn_to_pgn_list(pgn_data: str) -> list[chess.pgn.Game]:
    """
    Splits a pgn with multiple games into a list of pgns with one game each

    :param pgn_data: str, a PGN string, possibly containing many games, separated by 3 new lines each
    :return: List[chess.pgn.Game], a list of chess game objects read in from the PGN string
    """
    pgn_list_str = pgn_data.strip().split("\n\n\n")
    return [pgn_string_to_game(game) for game in pgn_list_str]


def walk_pgn_variations(game: chess.pgn.Game) -> Iterator[List[chess.Move]]:
    logger.info(f"[Parser] Walking PGN. Game has {len(game.variations)} starting variations.")
    stack = [(v, [v.move]) for v in reversed(game.variations)]

    count = 0
    while stack:
        node, path = stack.pop()
        count += 1
        yield path

        for variation in reversed(node.variations):
            new_path = path + [variation.move]
            stack.append((variation, new_path))
    logger.info(f"[Parser] Walk complete. Yielded {count} paths.")
