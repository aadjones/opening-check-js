"""
Chess Analysis Backend API

This module runs on the server and provides the main API endpoints for the chess analysis service.
It handles game analysis, deviation tracking, and Lichess API proxying.

🏗️ Architecture:
1. FastAPI Server (this file)
   - Runs on port 8000 (configurable)
   - Handles HTTP requests from frontend
   - Proxies requests to Lichess API
   - Coordinates game analysis

2. API Endpoints:
   /api/analyze_games    - Analyzes games for deviations
   /api/deviations       - Lists user's deviations
   /api/deviations/{id}  - Gets a specific deviation
   /proxy/*             - Proxies requests to Lichess API
   /health              - Health check endpoint

3. Data Flow:
   Frontend -> FastAPI -> Lichess API
                -> Analysis Service
                -> Supabase Database

🔐 Security:
- CORS enabled for frontend access
- JWT validation for authenticated endpoints
- Rate limiting on Lichess API calls
"""

import os
import time
from datetime import datetime
from typing import Any, Awaitable, Callable, List, Optional, Tuple

import httpx
import jwt
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, HttpUrl

# Import your new service and the DeviationResult class
from analysis_service import perform_game_analysis
from deviation_result import DeviationResult
from error_handling import LichessApiError, handle_lichess_response, handle_network_error, handle_unexpected_error
from logging_config import setup_logging
from supabase_client import get_deviation_by_id, get_deviations_for_user
from supabase_models import OpeningDeviation, User

# Constants
LICHESS_API_BASE_URL = "https://lichess.org/api"


# Auth
async def get_current_user(request: Request) -> User:
    """Get the current user from the request headers."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]
    try:
        # Decode JWT token to get user info
        # The token is signed by our edge function and contains user claims

        # Get JWT secret from environment
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        # Decode and verify token
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        # Get user profile from database
        from supabase_client import get_admin_client

        client = get_admin_client()
        response = client.table("profiles").select("*").eq("id", payload["sub"]).single().execute()

        if not response.data:
            raise HTTPException(status_code=401, detail="User not found")

        profile = response.data
        return User(
            id=profile["id"], lichess_username=profile["lichess_username"], access_token=profile["access_token"]
        )
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    username: str
    study_url_white: HttpUrl
    study_url_black: HttpUrl
    max_games: int = 10
    since: Optional[datetime] = None
    scope: Optional[str] = None  # 'recent' or 'today'


class AnalysisResponse(BaseModel):
    message: str
    deviations: List[DeviationResult]


# --- End Pydantic Models ---

app = FastAPI(title="Chess Analysis Backend")

# Get allowed origins from environment variable, default to local development
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174").split(",")

app.add_middleware(
    CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# Configure logging
logger = setup_logging(__name__)


@app.get("/")
async def root() -> dict[str, str]:
    logger.info("Root endpoint called")
    return {"message": "Hello from the Chess Backend!"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    logger.info("Health check endpoint called")
    return {"status": "healthy"}


@app.get("/api/dummy_games")
async def get_dummy_games() -> dict[str, List[str]]:
    return {"games": ["Game 1: My Awesome Win", "Game 2: That Close Draw", "Game 3: Learning Opportunity"]}


@app.post("/api/analyze_games", response_model=AnalysisResponse)
async def analyze_games_endpoint(request: AnalysisRequest) -> AnalysisResponse:
    try:
        logger.info(f"Received analysis request for user: {request.username}, scope: {request.scope}")

        # If scope is 'today', set since to start of today
        since = request.since
        if request.scope == "today":
            since = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            logger.info(f"Analyzing today's games since {since}")

        python_results: List[Tuple[Optional[DeviationResult], str]] = perform_game_analysis(
            username=request.username,
            study_url_white=str(request.study_url_white),
            study_url_black=str(request.study_url_black),
            max_games=request.max_games,
            since=since,
        )

        # Filter out None results and extract just the DeviationResult objects
        deviations = [d for d, _ in python_results if d is not None]

        # Customize message based on scope
        if request.scope == "today":
            message = f"Found {len(deviations)} deviations in {len(python_results)} games played today"
        else:
            message = f"Found {len(deviations)} deviations in {len(python_results)} games"

        return AnalysisResponse(
            message=message,
            deviations=deviations,
        )

    except Exception as e:
        logger.error(f"Error analyzing games: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/proxy/lichess/{path:path}")
async def proxy_lichess(path: str, request: Request, current_user: User = Depends(get_current_user)) -> Any:
    """
    Proxy endpoint for Lichess API requests with improved error handling.

    This endpoint forwards requests to the Lichess API while:
    1. Adding authentication
    2. Handling rate limits
    3. Providing consistent error responses
    4. Logging errors appropriately
    """
    try:
        # Get the full URL from the request
        url = f"{LICHESS_API_BASE_URL}/{path}"
        params = dict(request.query_params)

        # Forward the request to Lichess
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url, params=params, headers={"Authorization": f"Bearer {current_user.access_token}"}, timeout=30.0
            )

            # Handle any Lichess API errors
            handle_lichess_response(response)

            # Log successful requests
            logger.info(f"Successful Lichess API request: {path}")

            # Return the response with proper content type
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "application/json"),
                status_code=response.status_code,
            )

    except httpx.RequestError as e:
        handle_network_error(e)
    except LichessApiError:
        # Re-raise Lichess API errors as they're already properly formatted
        raise
    except Exception as e:
        handle_unexpected_error(e)


@app.get("/api/deviations", response_model=List[OpeningDeviation])
async def get_deviations(
    user_id: str = Query(..., description="User UUID. TODO: Replace with auth extraction."),
    limit: int = Query(10, ge=1, le=100, description="Number of deviations to fetch."),
    offset: int = Query(0, ge=0, description="Offset for pagination."),
    review_status: Optional[str] = Query(None, description="Filter by review status (needs_review, reviewed, etc.)"),
    active_studies_only: bool = Query(True, description="Only show deviations from active studies."),
) -> List[OpeningDeviation]:
    """
    Fetch deviations for a user with pagination and optional review_status filter.
    By default, only shows deviations from active studies.
    TODO: Replace user_id query param with extraction from authentication context (JWT/session) for production security.
    """
    rows = get_deviations_for_user(
        user_id=user_id,
        limit=limit,
        offset=offset,
        review_status=review_status,
        active_studies_only=active_studies_only,
    )
    # Convert each dict (row) into an OpeningDeviation instance.
    return [OpeningDeviation(**row) for row in rows]


@app.get("/api/deviations/{deviation_id}", response_model=OpeningDeviation)
async def get_deviation(deviation_id: str) -> OpeningDeviation:
    """
    Fetch a single deviation by its ID.
    """
    row = get_deviation_by_id(deviation_id)
    if not row:
        raise HTTPException(status_code=404, detail="Deviation not found")
    return OpeningDeviation(**row)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    """Log all requests and their processing time."""
    start_time = time.time()
    response: Response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"Request: {request.method} {request.url.path} " f"Status: {response.status_code} " f"Time: {process_time:.3f}s"
    )
    return response
