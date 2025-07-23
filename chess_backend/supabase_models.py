# This file is auto-generated. Do not edit by hand!
from typing import Any, Optional

from pydantic import BaseModel


class OpeningDeviation(BaseModel):
    actual_move: Optional[str] = None
    color: Optional[str] = None
    detected_at: Optional[str] = None
    deviation_uci: Optional[str] = None
    expected_move: Optional[str] = None
    first_deviator: Optional[str] = None
    game_id: Optional[str] = None
    id: Optional[str] = None
    move_number: Optional[int] = None
    opening_name: Optional[str] = None
    pgn: Optional[str] = None
    position_fen: Optional[str] = None
    previous_position_fen: Optional[str] = None
    reference_uci: Optional[str] = None
    review_result: Optional[str] = None
    review_status: Optional[Any] = None
    reviewed_at: Optional[str] = None
    study_id: Optional[str] = None
    user_id: Optional[str] = None


class User(BaseModel):
    access_token: Optional[str] = None
    created_at: Optional[str] = None
    email: Optional[str] = None
    id: Optional[str] = None
    last_synced_at: Optional[str] = None
    lichess_username: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    updated_at: Optional[str] = None
