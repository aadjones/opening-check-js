#!/usr/bin/env python3
"""
Production startup script for Chess Analysis Backend
Handles environment variable validation and starts the server
"""

import os
import sys
from pathlib import Path


def validate_environment() -> None:
    """Validate that all required environment variables are set"""
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]

    missing_vars = []

    # Check for JWT secret (either name is fine)
    if not (os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET")):
        missing_vars.append("SUPABASE_JWT_SECRET or JWT_SECRET")

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these variables before starting the server.")
        sys.exit(1)

    print("✅ All required environment variables are set")


def start_server() -> None:
    """Start the FastAPI server using uvicorn"""
    import uvicorn

    # Get port from environment (Railway sets this automatically)
    port = int(os.getenv("PORT", 8000))

    # Get host (should be 0.0.0.0 for Railway)
    host = os.getenv("HOST", "0.0.0.0")

    print(f"🚀 Starting server on {host}:{port}")

    # Start the server
    uvicorn.run("main:app", host=host, port=port, log_level="info", access_log=True)


if __name__ == "__main__":
    print("🔧 Chess Analysis Backend - Production Startup")

    # Change to the script directory
    script_dir = Path(__file__).resolve().parent
    os.chdir(script_dir)

    # Validate environment
    validate_environment()

    # Start server
    start_server()
