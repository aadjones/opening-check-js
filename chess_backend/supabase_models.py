# This file is auto-generated. Do not edit by hand!
from typing import Optional

from pydantic import BaseModel


class OpeningDeviation(BaseModel):
    actual_move: Optional[str] = None
    color: Optional[str] = None
    detected_at: Optional[str] = None
    deviation_uci: Optional[str] = None
    expected_move: Optional[str] = None
    game_id: Optional[str] = None
    id: Optional[str] = None
    move_number: Optional[int] = None
    pgn: Optional[str] = None
    position_fen: Optional[str] = None
    reference_uci: Optional[str] = None
    review_result: Optional[str] = None
    reviewed_at: Optional[str] = None
    study_id: Optional[str] = None
    user_id: Optional[str] = None
