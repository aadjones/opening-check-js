"""
This module contains the DeviationResult class for representing when your chess game
first deviates from a reference game.
"""

from typing import Optional

from pydantic import BaseModel


class DeviationResult(BaseModel):
    """
    Represents the result of finding a deviation between your chess game and a reference game.

    Attributes:
        first_deviator (str): Who deviated first - "user" or "opponent".
        move_number (int): The move number where the deviation occurs.
        deviation_san (str): The Standard Algebraic Notation (SAN) of the deviating move.
        reference_san (str): The SAN of the expected move in the repertoire.
        player_color (str): The color of the player who deviated.
        board_fen (str): The FEN string representing the position right before the deviation.
        pgn (str): The full game PGN.
        deviation_uci (Optional[str]): The UCI notation of the deviating move.
        reference_uci (Optional[str]): The UCI notation of the expected move in the repertoire.
    """

    first_deviator: str
    move_number: int
    deviation_san: str
    reference_san: str
    player_color: str
    board_fen: str
    pgn: str = ""
    deviation_uci: Optional[str] = None
    reference_uci: Optional[str] = None
    previous_position_fen: Optional[str] = None

    model_config = {
        "json_schema_extra": {"examples": [{"board_fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}]},
    }

    def __repr__(self) -> str:
        return (
            f"DeviationResult(first_deviator={self.first_deviator!r}, "
            f"move_number={self.move_number}, "
            f"deviation_san={self.deviation_san!r}, "
            f"reference_san={self.reference_san!r}, "
            f"player_color={self.player_color!r}, "
            f"board_fen={self.board_fen!r})"
        )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, DeviationResult):
            # don't attempt to compare against unrelated types
            return NotImplemented

        return (
            self.first_deviator == other.first_deviator
            and self.move_number == other.move_number
            and self.deviation_san == other.deviation_san
            and self.reference_san == other.reference_san
            and self.player_color == other.player_color
            # Note: We're intentionally not comparing the 'board_fen' attribute here.
        )
