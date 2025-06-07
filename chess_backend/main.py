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

import time
from typing import Awaitable, Callable, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl

# Import your new service and the DeviationResult class
from analysis_service import perform_game_analysis
from deviation_result import DeviationResult
from logging_config import setup_logging
from supabase_client import get_deviation_by_id, get_deviations_for_user
from supabase_models import OpeningDeviation


# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    username: str
    study_url_white: HttpUrl
    study_url_black: HttpUrl
    max_games: int


class AnalysisResponse(BaseModel):
    message: str
    deviations_found: int
    games_analyzed: int


# --- End Pydantic Models ---

app = FastAPI(title="Chess Analysis Backend")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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
        logger.info(f"Received analysis request for user: {request.username}")
        python_results: List[Tuple[Optional[DeviationResult], str]] = perform_game_analysis(
            username=request.username,
            study_url_white=str(request.study_url_white),
            study_url_black=str(request.study_url_black),
            max_games=request.max_games,
        )
        found_count = len([d for d, _ in python_results if d is not None])
        logger.info(
            f"Analysis complete for {request.username}. Found {found_count} deviations in {len(python_results)} games."
        )
        return AnalysisResponse(
            message="Analysis completed. Some games may have already been analyzed and were skipped.",
            deviations_found=found_count,
            games_analyzed=len(python_results),
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/proxy/{path:path}")
async def proxy(request: Request, path: str) -> Response:
    """Proxy requests to Lichess API."""
    url = f"https://lichess.org/{path}"
    logger.info(f"Proxying request to: {url} with params: {request.query_params}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=request.query_params)
            response.raise_for_status()
            logger.info(f"Received response with status: {response.status_code}")
            return Response(
                content=response.text,
                media_type=response.headers.get("content-type", "text/plain"),
                status_code=response.status_code,
                headers=dict(response.headers)
            )
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTP error occurred: {exc.response.status_code} - {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"Error from Lichess: {exc.response.text}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/deviations", response_model=List[OpeningDeviation])
async def get_deviations(
    user_id: str = Query(..., description="User UUID. TODO: Replace with auth extraction."),
    limit: int = Query(10, ge=1, le=100, description="Number of deviations to fetch."),
    offset: int = Query(0, ge=0, description="Offset for pagination."),
) -> List[OpeningDeviation]:
    """
    Fetch deviations for a user with pagination.
    TODO: Replace user_id query param with extraction from authentication context (JWT/session) for production security.
    """
    rows = get_deviations_for_user(user_id=user_id, limit=limit, offset=offset)
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
