"""
This module contains the DeviationResult class for representing when your chess game
first deviates from a reference game.
"""

import chess
from typing import Optional


class DeviationResult:
    """
    Represents the result of finding a deviation between your chess game and a reference game.

    Attributes:
        whole_move_number (int): The move number where the deviation occurs.
        deviation_san (str): The Standard Algebraic Notation (SAN) of the deviating move.
        reference_san (str): The SAN of the expected move in the repertoire.
        player_color (str): The color of the player who deviated.
        board (chess.Board): A board state to represent the position right before the deviation.
    """

    def __init__(
        self,
        whole_move_number: int,
        deviation_san: str,
        reference_san: str,
        player_color: str,
        board: Optional[chess.Board] = None,
    ):
        self.whole_move_number = whole_move_number
        self.deviation_san = deviation_san
        self.reference_san = reference_san
        self.player_color = player_color
        self.board = chess.Board() if board is None else board

    def __repr__(self):
        return (
            f"DeviationResult(whole_move_number={self.whole_move_number}, "
            f"deviation_san={self.deviation_san!r}, "
            f"reference_san={self.reference_san!r}, "
            f"player_color={self.player_color!r}, "
            f"board_fen={self.board.fen()!r})"
        )

    def __eq__(self, other):
        if not isinstance(other, DeviationResult):
            # don't attempt to compare against unrelated types
            return NotImplemented

        return (
            self.whole_move_number == other.whole_move_number
            and self.deviation_san == other.deviation_san
            and self.reference_san == other.reference_san
            and self.player_color == other.player_color
            # Note: We're intentionally not comparing the 'board' attribute here.
        )
