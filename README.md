# Out Of Book

Compare the chess openings in the games you play to your preparation to track patterns.

## Quick Start

### Backend
```bash
cd chess_backend
make setup
make start
```

### Frontend
```bash
cd chess_frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to use the app.

## Development

- Backend: FastAPI + Python 3.11
- Frontend: React + TypeScript + Vite
- Database: Supabase (PostgreSQL)

### Backend Commands
```bash
cd chess_backend
make test      # Run tests
make format    # Format code
make lint      # Lint code
make kill      # Restart port 8000
python -m logging_config --update-gitignore  # Update .gitignore with log patterns
```

### Frontend Commands
```bash
cd chess_frontend
npm run test        # Run tests
npm run build       # Build for production
```

## BrowserTools MCP (Debugging)

For enhanced debugging with Cursor AI, start the BrowserTools server to capture browser logs:

### Setup (One-time)
1. Install Chrome extension from [AgentDesk BrowserTools](https://github.com/AgentDeskAI/browser-tools-mcp)
2. MCP server is already configured in `.cursor/mcp.json`

### Daily Usage
```bash
# Start BrowserTools server (in a separate terminal)
npx @agentdeskai/browser-tools-server@1.2.0

# Open Chrome dev tools on your chess app
# Right-click → Inspect (or press F12)
```

Once running, you can ask Cursor:
- "Enter debugger mode and analyze console logs"
- "Take a screenshot of the current state" 
- "Check for network errors"

## API

Backend runs on `http://localhost:8000` with docs at `/docs`.

## Environment

Copy `.env.example` to `.env` in both directories and add your Supabase credentials if using database features. 