# Chess Opening Deviation Analyzer

A web application that analyzes chess games to find opening deviations and their outcomes.

## Project Structure

- `chess_frontend/` - React/TypeScript frontend application
- `chess_backend/` - Python FastAPI backend service

## Backend Setup

### Quick Start (Cross-Platform)

The Makefile automatically detects your operating system (Windows, Mac, or Linux) and uses the appropriate commands.

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

If you prefer to set up manually or the Makefile doesn't work on your system:

#### Windows (PowerShell/CMD)
```bash
cd chess_backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
pip install -e .
uvicorn main:app --reload
```

#### Mac/Linux
```bash
cd chess_backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
pip install -e .
uvicorn main:app --reload
```

### Environment Variables (Optional)

For Supabase features, set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Database Setup (If using Supabase)

1. Go to your Supabase project dashboard (using the URL from your environment variables)
2. Click "SQL Editor" in the left sidebar
3. Copy the contents of `supabase/migrations/20250526184440_initial_schema.sql`
4. Paste and run the SQL in the editor

The backend will run on `http://localhost:8000`

### Available Make Commands

All commands work cross-platform (Windows, Mac, Linux):

- `make help` - Show all available commands
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
make test    # Run all backend tests (works on all platforms)
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
- The Makefile automatically detects your OS and uses appropriate commands

## Cross-Platform Notes

The project is designed to work seamlessly on:
- **Windows** (PowerShell, Command Prompt)
- **macOS** (Terminal, Bash, Zsh)
- **Linux** (Bash and other shells)

The Makefile automatically detects your operating system and uses the appropriate:
- Python command (`python` vs `python3`)
- Virtual environment activation method
- File system commands

If you encounter any platform-specific issues, please check the manual setup instructions above.

## Proxy Functionality for Lichess API

To handle CORS issues when accessing the Lichess API from the frontend, a proxy endpoint has been implemented in the backend.

### Proxy Endpoint

- **Endpoint**: `/proxy/{path:path}`
- **Description**: This endpoint forwards requests to the Lichess API, allowing the frontend to bypass CORS restrictions.
- **Usage**: Replace direct Lichess API calls in the frontend with calls to this proxy endpoint.
  - Example: Instead of calling `https://lichess.org/api/study/{studyId}.pgn`, use `/proxy/api/study/{studyId}.pgn`.

### How It Works

1. The frontend sends a request to the proxy endpoint with the desired Lichess API path.
2. The proxy forwards the request to the Lichess API and returns the response to the frontend.
3. This allows the frontend to access Lichess data without encountering CORS issues.

### Testing the Proxy

- Use tools like `curl` or Postman to test the proxy endpoint.
- Ensure the backend server is running and accessible at `http://localhost:8000`.

This proxy setup is essential for ensuring smooth communication between the frontend and the Lichess API, especially during development and testing. 