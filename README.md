# Chess Opening Deviation Analyzer

A web application that analyzes chess games to find opening deviations and their outcomes.

## Project Structure

- `chess_frontend/` - React/TypeScript frontend application
- `chess_backend/` - Python FastAPI backend service

## Backend Setup

### Quick Start (Automated)

1. Navigate to the backend directory:
   ```bash
   cd chess_backend
   ```

2. **First time setup:**
   ```bash
   make setup    # Creates virtual environment and installs dependencies
   ```

3. **Start the server:**
   ```bash
   make start    # Start the development server
   ```

### Manual Setup

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

4. Set up environment variables (optional for Supabase features):
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. Set up the database (if using Supabase features):
   1. Go to your Supabase project dashboard (using the URL from your environment variables)
   2. Click "SQL Editor" in the left sidebar
   3. Copy the contents of `supabase/migrations/20250526184440_initial_schema.sql`
   4. Paste and run the SQL in the editor

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will run on `http://localhost:8000`

### Available Make Commands

- `make setup` - Create virtual environment and install dependencies
- `make start` - Start the development server (localhost only)
- `make dev` - Start the server with external access
- `make test` - Run tests
- `make format` - Format code with black and sort imports with isort
- `make lint` - Lint code with flake8
- `make type-check` - Type check with mypy
- `make check-all` - Run all checks (format, lint, type-check, test)
- `make clean` - Clean up virtual environment and cache files

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd chess_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional for basic functionality):
   ```bash
   # Edit .env.local with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Enter a Lichess username to analyze their games
4. View the opening deviations and their outcomes

## Testing

### Backend Tests
```bash
cd chess_backend
make test    # Run all backend tests
```

### Frontend Tests
```bash
cd chess_frontend
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:ui     # Run tests with visual UI
npm run test:coverage  # Run tests with coverage
```

For detailed frontend testing information, see `chess_frontend/README-TESTING.md`.

## Development

- Backend API documentation is available at `http://localhost:8000/docs` when the server is running
- Frontend is built with React, TypeScript, and Vite
- Backend is built with Python, FastAPI, and python-chess 