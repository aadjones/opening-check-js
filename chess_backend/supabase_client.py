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


def get_user_id_from_username(username: str) -> str:
    client = get_admin_client()
    response = client.table("profiles").select("id").eq("lichess_username", username).limit(1).execute()
    data = response.data
    if data and len(data) > 0:
        user_id: str = data[0]["id"]
        return user_id
    raise Exception(f"User not found for username: {username}")


def insert_deviation_to_db(deviation: Dict[str, Any], pgn: str, username: str) -> None:
    client = get_admin_client()
    game_id = extract_game_id_from_pgn(pgn)
    user_id = get_user_id_from_username(username)

    # This logic already uses .get(), which works perfectly with the dict
    # from .model_dump(). No functional changes needed here.
    data = {
        "user_id": user_id,
        "game_id": game_id,
        "position_fen": deviation.get("board_fen"),
        "expected_move": deviation.get("reference_san"),
        "actual_move": deviation.get("deviation_san"),
        "move_number": deviation.get("move_number"),
        "color": deviation.get("player_color"),
        "pgn": pgn,
        "deviation_uci": deviation.get("deviation_uci"),
        "reference_uci": deviation.get("reference_uci"),
        "first_deviator": deviation.get("first_deviator"),
    }
    client.table("opening_deviations").upsert(data).execute()


def get_deviations_for_user(user_id: str, limit: int = 10, offset: int = 0) -> list[Dict[str, Any]]:
    """
    Fetch deviations for a given user_id with pagination.
    Returns a list of dicts, each representing a row from opening_deviations.
    """
    client = get_default_client()
    response = (
        client.table("opening_deviations")
        .select("*")
        .eq("user_id", user_id)
        .order("id", desc=True)
        .limit(limit)
        .offset(offset)
        .execute()
    )
    return response.data or []


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
