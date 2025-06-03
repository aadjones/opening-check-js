import logging
from typing import List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

# Import your new service and the DeviationResult class
from analysis_service import perform_game_analysis
from deviation_result import DeviationResult


# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    username: str
    study_url_white: HttpUrl
    study_url_black: HttpUrl
    max_games: int


# This will be the structure of each item in the list we send back to the frontend.
# Notice board_fen, reference_uci, and deviation_uci are new for the frontend.
class ApiDeviationResult(BaseModel):
    whole_move_number: int
    deviation_san: str
    reference_san: str
    player_color: str
    board_fen_before_deviation: str
    reference_uci: Optional[str] = None
    deviation_uci: Optional[str] = None
    pgn: str


# --- End Pydantic Models ---

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add any other URLs here, such as production URLs
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello from the Chess Backend!"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring and CI/CD"""
    return {"status": "healthy", "service": "chess-backend"}


@app.get("/api/dummy_games")
async def get_dummy_games() -> dict[str, List[str]]:
    return {"games": ["Game 1: My Awesome Win", "Game 2: That Close Draw", "Game 3: Learning Opportunity"]}


@app.post("/api/analyze_games", response_model=List[Optional[ApiDeviationResult]])
async def analyze_games_endpoint(request: AnalysisRequest) -> List[Optional[ApiDeviationResult]]:
    try:
        print(f"Received analysis request for user: {request.username}")
        python_results: List[Tuple[Optional[DeviationResult], str]] = perform_game_analysis(
            username=request.username,
            study_url_white=str(request.study_url_white),
            study_url_black=str(request.study_url_black),
            max_games=request.max_games,
        )

        api_results: List[Optional[ApiDeviationResult]] = []
        for deviation_result, pgn_string in python_results:
            if deviation_result:
                board_before_deviation = deviation_result.board.copy()
                ref_uci = None
                dev_uci = None
                try:
                    ref_uci = board_before_deviation.parse_san(deviation_result.reference_san).uci()
                    dev_uci = board_before_deviation.parse_san(deviation_result.deviation_san).uci()
                except Exception as e:
                    print(
                        f"Error parsing SAN to UCI for a deviation: {e} (SANs: {deviation_result.reference_san}, {deviation_result.deviation_san} on FEN: {board_before_deviation.fen()})"
                    )

                api_results.append(
                    ApiDeviationResult(
                        whole_move_number=deviation_result.whole_move_number,
                        deviation_san=deviation_result.deviation_san,
                        reference_san=deviation_result.reference_san,
                        player_color=deviation_result.player_color,
                        board_fen_before_deviation=board_before_deviation.fen(),
                        reference_uci=ref_uci,
                        deviation_uci=dev_uci,
                        pgn=deviation_result.pgn,
                    )
                )
            else:
                api_results.append(None)

        print(f"Sending {len(api_results)} results back.")
        return api_results

    except Exception as e:
        print(f"An unexpected error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/proxy/{path:path}")
async def proxy(request: Request, path: str) -> Response:
    url = f"https://lichess.org/{path}"
    logging.info(f"Proxying request to: {url} with params: {request.query_params}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=request.query_params)
            response.raise_for_status()
            logging.info(f"Received response with status: {response.status_code}")
            return Response(content=response.text, media_type="text/plain")
    except httpx.HTTPStatusError as exc:
        logging.error(f"HTTP error occurred: {exc.response.status_code} - {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"Error from Lichess: {exc.response.text}")
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
