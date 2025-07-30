# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Out Of Book is a chess analysis application that compares played games against opening preparation to identify deviations. The project also includes a comprehensive spaced repetition system for chess puzzle practice and learning. The project consists of:

- **Frontend**: React + TypeScript + Vite application 
- **Backend**: FastAPI Python service with chess analysis engine
- **Database**: Supabase PostgreSQL with RLS policies
- **Authentication**: Lichess OAuth integration via Supabase Auth
- **Spaced Repetition**: Scientific learning system using SM2+ and Basic algorithms for optimized chess puzzle practice

## Architecture

### Frontend (chess_frontend/)
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Routing**: React Router with protected routes requiring authentication
- **State Management**: React Context (`AuthJSContext`, `StudyUpdateContext`)
- **Key Libraries**: `react-chessboard`, `chess.js`, `@supabase/supabase-js`
- **Styling**: CSS Modules exclusively (`Component.module.css`)

### Backend (chess_backend/)
- **Entry Point**: `main.py` - FastAPI server on port 8000
- **Core Services**: 
  - `analysis_service.py` - Chess game analysis and deviation detection
  - `lichess_api.py` - Lichess API integration and rate limiting
  - `supabase_client.py` - Database operations with Supabase
- **Data Models**: `deviation_result.py`, `supabase_models.py` (generated from Supabase)

### Database (supabase/)
- **Local Development**: Supabase CLI on port 54321
- **Key Tables**: profiles, games, deviations, studies
- **Edge Functions**: JWT signing, scheduled sync, game analysis
- **Migrations**: Located in `supabase/migrations/`

## Common Development Commands

### Backend
```bash
cd chess_backend
make setup          # Create venv and install dependencies
make start           # Start FastAPI server with ngrok tunnel
make test            # Run pytest tests
make format          # Format with black + isort
make lint            # Lint with flake8
make type-check      # Type check with mypy
make check-all       # Run all checks (format, lint, type-check, test)
make gen-pytypes     # Generate Pydantic models from Supabase schema
```

### Frontend
```bash
cd chess_frontend
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run build        # Build for production
npm run lint         # ESLint check
npm run format       # Format with Prettier
npm run gen:types    # Generate TypeScript types from Supabase
```

### Supabase
```bash
supabase start       # Start local Supabase (port 54321) 
supabase stop        # Stop local Supabase
supabase db reset    # Reset database with migrations
supabase gen types typescript --project-id [PROJECT_ID] > chess_frontend/src/types/supabase.ts
```

## Key Patterns

### Frontend
- Use CSS Modules: `import styles from './Component.module.css'`
- Environment variables: `import.meta.env.VITE_SUPABASE_URL`
- Chess components: Import from `react-chessboard` and `chess.js`
- Testing: Vitest + React Testing Library
- Barrel exports: `import { Component } from '../components'`

### Backend
- All endpoints use Pydantic models for request/response
- Dependency injection for Supabase client: `supabase: Client = Depends(get_supabase_client)`
- Error handling: `HTTPException(status_code=422, detail="message")`
- Authentication: JWT token validation via `authorization: str = Header(None)`
- Environment: `os.getenv()` for configuration
- **Type Annotations**: ALL functions must have complete type annotations for parameters and return values

### Database
- RLS policies enforce row-level security
- Generated types sync between Supabase and frontend/backend
- Edge functions handle server-side logic (JWT signing, background sync)

## File Structure Conventions

```
chess_frontend/src/
├── components/
│   ├── chess/          # Chess-specific components
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   └── ui/            # Generic UI components
├── contexts/          # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
│   ├── auth/         # Authentication utilities
│   ├── database/     # Database operations
│   └── lichess/      # Lichess API utilities
├── pages/            # Route components
├── styles/           # Global CSS
├── test/             # Test files
└── types/            # TypeScript type definitions

chess_backend/
├── main.py           # FastAPI entry point
├── analysis_service.py # Core analysis logic
├── lichess_api.py    # Lichess API client
├── supabase_client.py # Database client
├── tests/            # Test files
└── scripts/          # Utility scripts
```

## Testing Strategy

- **Frontend**: 
  - **Preferred**: Unit tests for business logic and utility functions (fast, reliable)
  - **When needed**: Component/UI testing with Vitest + React Testing Library (only when specifically requested)
- **Backend**: API testing with pytest + httpx
- **Integration**: Supabase integration tests in both frontend and backend
- **Run all tests**: `make check-all` (backend) + `npm run test` (frontend)

### Testing Guidelines
- **Default to unit tests**: Test pure functions and business logic without UI complexity
- **Avoid UI tests unless requested**: UI tests are slower, more brittle, and harder to maintain
- **Focus on logic**: Test the core functionality, not the presentation layer
- **Keep tests simple**: Prefer isolated, fast-running tests over complex integration tests

## Development Workflow

1. **Local Setup**: Start Supabase → Backend → Frontend
2. **API Changes**: Update backend → regenerate types → update frontend
3. **Database Changes**: Create migration → test locally → deploy
4. **Testing**: Run tests locally before committing
5. **Type Safety**: Always run type generation after schema changes
6. **Before Pushing**: Always run `make check-all` in chess_backend/ before pushing to GitHub
   - This includes: format, lint (flake8), type-check (mypy), and tests
   - Ensures code passes all CI checks locally before pushing