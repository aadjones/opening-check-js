"""
Error handling utilities for the chess analysis backend.

This module provides centralized error handling for Lichess API interactions
and other common error cases. It helps keep the main API code clean and
consistent in how errors are handled and reported.
"""

import logging
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class LichessApiError(HTTPException):
    """Base class for Lichess API errors with structured error details."""

    def __init__(self, status_code: int, error: str, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=status_code, detail={"error": error, "message": message, **(details or {})})


def handle_lichess_response(response: httpx.Response) -> None:
    """Handle Lichess API response and raise appropriate errors."""
    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After", "60")
        logger.warning(f"Rate limit hit. Retry after: {retry_after}s")
        raise LichessApiError(
            status_code=429,
            error="Rate limit exceeded",
            message="Too many requests to Lichess API. Please try again later.",
            details={
                "retry_after": retry_after,
                "limit_type": response.headers.get("X-RateLimit-Limit", "unknown"),
                "remaining": response.headers.get("X-RateLimit-Remaining", "unknown"),
            },
        )

    if response.status_code == 404:
        raise LichessApiError(
            status_code=404, error="Not found", message="The requested resource was not found on Lichess."
        )

    if response.status_code == 403:
        raise LichessApiError(
            status_code=403,
            error="Access denied",
            message="You don't have permission to access this resource on Lichess.",
        )

    if not response.is_success:
        error_text = response.text[:200]  # Truncate long error messages
        logger.error(f"Lichess API error: {response.status_code} - {error_text}")
        raise LichessApiError(
            status_code=response.status_code,
            error="Lichess API error",
            message=f"Error from Lichess API: {error_text}",
            details={"status_code": response.status_code},
        )


def handle_network_error(error: httpx.RequestError) -> None:
    """Handle network-related errors."""
    logger.error(f"Network error occurred: {str(error)}")
    raise LichessApiError(
        status_code=503,
        error="Network error",
        message="Unable to connect to Lichess. Please check your internet connection and try again.",
        details={"original_error": str(error)},
    )


def handle_unexpected_error(error: Exception) -> None:
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {str(error)}")
    raise LichessApiError(
        status_code=500,
        error="Internal server error",
        message="An unexpected error occurred while communicating with Lichess.",
        details={"original_error": str(error)},
    )
