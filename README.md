# Chess Opening Deviation Analyzer

A web application that analyzes chess games to find opening deviations and their outcomes.

## Project Structure

- `chess_frontend/` - React/TypeScript frontend application
- `chess_backend/` - Python FastAPI backend service

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd chess_backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows, use: env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will run on `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd chess_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Enter a Lichess username to analyze their games
4. View the opening deviations and their outcomes

## Development

- Backend API documentation is available at `http://localhost:8000/docs` when the server is running
- Frontend is built with React, TypeScript, and Vite
- Backend is built with Python, FastAPI, and python-chess 