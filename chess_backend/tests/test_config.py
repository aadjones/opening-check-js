"""
Configuration and environment tests for the chess backend.
These tests verify that the application is properly configured.
"""

import os
from unittest.mock import patch

import pytest


def test_environment_variables() -> None:
    """Test that environment variables are accessible (even if not set)."""
    # These should not raise exceptions
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # If set, they should not be empty
    if supabase_url:
        assert len(supabase_url) > 0
        assert supabase_url.startswith("https://")

    if supabase_anon_key:
        assert len(supabase_anon_key) > 10  # Reasonable minimum length

    if supabase_service_key:
        assert len(supabase_service_key) > 10  # Reasonable minimum length


def test_supabase_client_import() -> None:
    """Test that supabase client can be imported without errors."""
    try:
        from supabase_client import get_supabase_client

        client = get_supabase_client()
        assert client is not None
    except Exception as e:
        pytest.fail(f"Failed to import or create supabase client: {e}")


def test_core_modules_import() -> None:
    """Test that core application modules can be imported."""
    try:
        import analysis_service
        import chess_utils
        import deviation_result

        # Test that key functions exist
        assert hasattr(analysis_service, "perform_game_analysis")
        assert hasattr(chess_utils, "find_deviation_in_entire_study_white_and_black")
        assert hasattr(deviation_result, "DeviationResult")

    except ImportError as e:
        pytest.fail(f"Failed to import core modules: {e}")


def test_fastapi_app_creation() -> None:
    """Test that the FastAPI app can be created without errors."""
    try:
        from main import app

        assert app is not None
        assert hasattr(app, "routes")

        # Check that we have some routes
        route_paths = [route.path for route in app.routes if hasattr(route, "path")]
        assert len(route_paths) > 0
        assert "/" in route_paths  # Should have root route

    except Exception as e:
        pytest.fail(f"Failed to create FastAPI app: {e}")


@patch.dict(os.environ, {}, clear=True)
def test_app_works_without_env_vars() -> None:
    """Test that the app can start even without environment variables set."""
    try:
        from supabase_client import get_supabase_client

        # Should not raise an exception even without env vars
        client = get_supabase_client()
        assert client is not None
    except Exception as e:
        pytest.fail(f"App should work without env vars, but failed: {e}")


def test_python_dependencies() -> None:
    """Test that required Python packages are available."""
    required_packages = ["fastapi", "uvicorn", "chess", "requests", "supabase", "pydantic"]

    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            pytest.fail(f"Required package '{package}' is not installed")
