# tests/test_config.py

"""
Configuration and environment tests for the chess backend.
These tests verify that the application is properly configured.
"""

import pytest


def test_core_modules_import() -> None:
    """Test that core application modules can be imported."""
    try:
        import analysis_service
        import deviation_result
        import repertoire_trie  # <-- ADD this import

        # Test that key components exist
        assert hasattr(analysis_service, "perform_game_analysis")
        assert hasattr(deviation_result, "DeviationResult")

        # --- THIS IS THE UPDATED PART ---
        # Check for the new RepertoireTrie class and its main method
        assert hasattr(repertoire_trie, "RepertoireTrie")
        assert hasattr(repertoire_trie.RepertoireTrie, "find_deviation")

    except ImportError as e:
        pytest.fail(f"Failed to import core modules: {e}")
