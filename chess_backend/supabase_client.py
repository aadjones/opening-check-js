"""
Supabase Database Client

This module runs on the server and provides database access to Supabase.
It manages two types of clients:
1. Default client (anon key) - for regular operations
2. Admin client (service role) - for privileged operations

🏗️ Architecture:
Server -> Supabase Client -> Database
       -> Admin Client -> Database (with elevated privileges)

🔐 Security:
- Uses environment variables for credentials
- Service role key for admin operations
- Anon key for regular operations
- RLS policies still apply based on client type

📝 Database Operations:
- User profile management
- Deviation storage and retrieval
- Study tracking
"""

import os
import re
from datetime import datetime
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables only if not in test mode
if not os.getenv("PYTEST_CURRENT_TEST"):
    load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Global client instances (created lazily)
_supabase_client: Optional[Client] = None
_supabase_admin: Optional[Client] = None


def get_supabase_client(use_service_role: bool = False) -> Client:
    """
    Get a configured Supabase client.

    Args:
        use_service_role: If True, use service role key for admin operations.
                         If False, use anon key for regular operations.

    Returns:
        Configured Supabase client

    Raises:
        ValueError: If required environment variables are not set
    """
    # Get fresh environment variables (in case they were patched in tests)
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url:
        raise ValueError("SUPABASE_URL environment variable is not set")

    if use_service_role:
        if not service_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
        return create_client(url, service_key)
    else:
        if not anon_key:
            raise ValueError("SUPABASE_ANON_KEY environment variable is not set")
        return create_client(url, anon_key)


def get_default_client() -> Client:
    """Get the default Supabase client (anon key), creating it if needed."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = get_supabase_client(use_service_role=False)
    return _supabase_client


def get_admin_client() -> Client:
    """Get the admin Supabase client (service role key), creating it if needed."""
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = get_supabase_client(use_service_role=True)
    return _supabase_admin


def test_connection() -> bool:
    """Test the Supabase connection."""
    try:
        # Try to fetch from a table (this will fail if connection is bad)
        client = get_default_client()
        client.table("profiles").select("id").limit(1).execute()
        print("✅ Supabase connection successful!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False


def extract_game_id_from_pgn(pgn: str) -> Optional[str]:
    match = re.search(r'Site "https://lichess.org/([a-zA-Z0-9]{8})"', pgn)
    if match:
        return match.group(1)
    return None


def extract_game_date_from_pgn(pgn: str) -> Optional[datetime]:
    """Extract the game date from PGN headers and convert to datetime."""
    # Try UTCDate first (more reliable), then fall back to Date
    date_match = re.search(r'\[UTCDate "([^"]+)"\]', pgn)
    if not date_match:
        date_match = re.search(r'\[Date "([^"]+)"\]', pgn)

    if date_match:
        date_str = date_match.group(1)
        try:
            # Parse date in format "YYYY.MM.DD"
            return datetime.strptime(date_str, "%Y.%m.%d")
        except ValueError:
            try:
                # Try alternative format "YYYY-MM-DD"
                return datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                return None
    return None


def get_user_id_from_username(username: str) -> str:
    client = get_admin_client()
    response = client.table("profiles").select("id").eq("lichess_username", username).limit(1).execute()
    data = response.data
    if data and len(data) > 0:
        user_id: str = data[0]["id"]
        return user_id
    raise Exception(f"User not found for username: {username}")


def get_study_id_from_url(study_url: str, user_id: str) -> Optional[str]:
    """Get the study ID from the lichess_studies table based on study URL and user."""
    client = get_admin_client()
    response = (
        client.table("lichess_studies")
        .select("id")
        .eq("study_url", study_url)
        .eq("user_id", user_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    data = response.data
    if data and len(data) > 0:
        study_id = data[0].get("id")
        if isinstance(study_id, str):
            return study_id
    return None


def insert_deviation_to_db(deviation: Dict[str, Any], pgn: str, user_id: str, study_url: Optional[str] = None) -> None:
    """Saves a deviation record to the database using user_id (UUID)."""
    client = get_admin_client()
    game_id = extract_game_id_from_pgn(pgn)

    # Get study_id if study_url is provided
    study_id = None
    if study_url:
        study_id = get_study_id_from_url(study_url, user_id)

    data = {
        "user_id": user_id,
        "study_id": study_id,
        "game_id": game_id,
        "pgn": pgn,
        "opening_name": deviation.get("opening_name"),  # Still get opening_name
        "position_fen": deviation.get("board_fen"),
        "expected_move": deviation.get("reference_san"),
        "actual_move": deviation.get("deviation_san"),
        "move_number": deviation.get("move_number"),
        "color": deviation.get("player_color"),
        "deviation_uci": deviation.get("deviation_uci"),
        "reference_uci": deviation.get("reference_uci"),
        "first_deviator": deviation.get("first_deviator"),
        "previous_position_fen": deviation.get("previous_position_fen"),
    }
    client.table("opening_deviations").upsert(data, on_conflict="game_id, user_id").execute()


def get_deviations_for_user(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    review_status: Optional[str] = None,
    active_studies_only: bool = True,
) -> list[Dict[str, Any]]:
    """
    Fetch deviations for ``user_id`` with pagination and an optional
    ``review_status`` filter. If ``active_studies_only`` is ``True``, only
    deviations from active studies are returned. Results are limited in the
    database for scalability, but are ordered by the actual game date parsed
    from the PGN after retrieval.
    """
    client = get_default_client()

    if active_studies_only:
        # Get active study IDs for this user
        active_studies_response = (
            client.table("lichess_studies").select("id").eq("user_id", user_id).eq("is_active", True).execute()
        )
        active_study_ids = [study["id"] for study in active_studies_response.data or []]

        # If no active studies, return empty list
        if not active_study_ids:
            return []

        # Query deviations that belong to active studies
        query = client.table("opening_deviations").select("*").eq("user_id", user_id).in_("study_id", active_study_ids)
    else:
        # Query all deviations for the user
        query = client.table("opening_deviations").select("*").eq("user_id", user_id)

    if review_status:
        query = query.eq("review_status", review_status)

    response = query.order("detected_at", desc=True).range(offset, offset + limit - 1).execute()

    deviations = response.data or []

    def sort_key(dev: Dict[str, Any]) -> datetime:
        game_date = extract_game_date_from_pgn(dev.get("pgn", ""))
        if game_date:
            return game_date
        detected = dev.get("detected_at")
        if detected:
            try:
                return datetime.fromisoformat(detected.replace("Z", "+00:00"))
            except ValueError:
                pass
        return datetime(1900, 1, 1)

    deviations.sort(key=sort_key, reverse=True)

    return deviations


def get_deviation_by_id(deviation_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a single deviation by its ID.
    Returns a dict representing the row, or None if not found.
    """
    client = get_default_client()
    response = client.table("opening_deviations").select("*").eq("id", deviation_id).limit(1).execute()
    data = response.data
    if data and len(data) > 0:
        deviation: Dict[str, Any] = data[0]
        return deviation
    return None


if __name__ == "__main__":
    # Test the connection when run directly
    test_connection()
