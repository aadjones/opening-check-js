# chess-backend/main.py
from fastapi import FastAPI, HTTPException # <-- Add HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl # <-- Add BaseModel, HttpUrl
from typing import List, Optional

# Import your new service and the DeviationResult class
from analysis_service import perform_game_analysis
from deviation_result import DeviationResult as PythonDeviationResult # Rename for clarity

# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    username: str
    study_url_white: HttpUrl # HttpUrl validates it's a URL
    study_url_black: HttpUrl
    max_games: int

# This will be the structure of each item in the list we send back to the frontend.
# Notice board_fen, reference_uci, and deviation_uci are new for the frontend.
class ApiDeviationResult(BaseModel):
    whole_move_number: int
    deviation_san: str
    reference_san: str
    player_color: str
    board_fen_before_deviation: str # FEN of the board *before* the deviating move
    reference_uci: Optional[str] = None # e.g., "e2e4"
    deviation_uci: Optional[str] = None # e.g., "g1f3"

# --- End Pydantic Models ---

app = FastAPI()

# --- Add this for CORS ---
origins = [
    "http://localhost:5173",  # Default Vite dev server address
    "http://127.0.0.1:5173", # Also common for Vite
    # Add your frontend's deployed URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End CORS section ---


@app.get("/")
async def root():
    return {"message": "Hello from the Chess Backend!"}

# --- Add this new endpoint ---
@app.get("/api/dummy_games")
async def get_dummy_games():
    return {"games": ["Game 1: My Awesome Win", "Game 2: That Close Draw", "Game 3: Learning Opportunity"]}
# --- End new endpoint ---

@app.post("/api/analyze_games", response_model=List[Optional[ApiDeviationResult]])
async def analyze_games_endpoint(request: AnalysisRequest):
    try:
        print(f"Received analysis request for user: {request.username}")
        python_results: List[Optional[PythonDeviationResult]] = perform_game_analysis(
            username=request.username,
            study_url_white=str(request.study_url_white), # Convert HttpUrl to string
            study_url_black=str(request.study_url_black), # Convert HttpUrl to string
            max_games=request.max_games
        )

        api_results: List[Optional[ApiDeviationResult]] = []
        for res in python_results:
            if res:
                # The board in DeviationResult is the state *before* the deviating move
                board_before_deviation = res.board.copy() # Use a copy
                ref_uci = None
                dev_uci = None
                try:
                    ref_uci = board_before_deviation.parse_san(res.reference_san).uci()
                    dev_uci = board_before_deviation.parse_san(res.deviation_san).uci()
                except Exception as e:
                    print(f"Error parsing SAN to UCI for a deviation: {e} (SANs: {res.reference_san}, {res.deviation_san} on FEN: {board_before_deviation.fen()})")
                    # Decide how to handle: skip these UCIs, or mark the result as problematic

                api_results.append(ApiDeviationResult(
                    whole_move_number=res.whole_move_number,
                    deviation_san=res.deviation_san,
                    reference_san=res.reference_san,
                    player_color=res.player_color,
                    board_fen_before_deviation=board_before_deviation.fen(),
                    reference_uci=ref_uci,
                    deviation_uci=dev_uci
                ))
            else:
                api_results.append(None) # No deviation found for that game
        
        print(f"Sending {len(api_results)} results back.")
        return api_results

    except Exception as e:
        # Log the full error for debugging on the backend
        print(f"An unexpected error occurred during analysis: {e}")
        # Raise an HTTPException to send a proper error response to the client
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")