"""
Supabase client configuration for the chess backend.
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

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
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL environment variable is not set")
    
    if use_service_role:
        if not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    else:
        if not SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_ANON_KEY environment variable is not set")
        return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Create default clients
supabase_client = get_supabase_client(use_service_role=False)
supabase_admin = get_supabase_client(use_service_role=True)

def test_connection():
    """Test the Supabase connection."""
    try:
        # Try to fetch from a table (this will fail if connection is bad)
        response = supabase_client.table('profiles').select('id').limit(1).execute()
        print("✅ Supabase connection successful!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

if __name__ == "__main__":
    # Test the connection when run directly
    test_connection() 