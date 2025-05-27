"""
Supabase client configuration for the chess backend.
"""

import os
from typing import Optional

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


if __name__ == "__main__":
    # Test the connection when run directly
    test_connection()
