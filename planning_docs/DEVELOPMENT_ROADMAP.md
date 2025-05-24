# Development Roadmap - Simplified Hobby Version

## Phase 0: Quick Start (Week 1)
### Essential Setup
- [x] Set up development environment
- [ ] Supabase database setup (free tier) - **IN PROGRESS** 
  - ✅ Setup guide created (`planning_docs/SUPABASE_SETUP.md`)
  - ✅ Database schema ready (`planning_docs/supabase_schema.sql`)
  - ✅ Environment template created (`env.example`)
  - ⏳ Create Supabase account & project
  - ⏳ Run database schema
  - ⏳ Configure environment variables
- [ ] Basic environment configuration (.env files)

### Minimal Architecture
- [ ] FastAPI project structure
- [ ] Basic database models
- [ ] Simple error handling
- [ ] Basic logging

## Phase 1: Core MVP (Weeks 2-4)
### Backend Essentials
- [ ] Lichess OAuth integration
- [ ] User authentication (simple)
- [ ] Study fetching from Lichess
- [ ] Basic deviation detection
- [ ] Simple REST API

### Frontend Basics
- [ ] React setup with TypeScript
- [ ] Login/logout flow
- [ ] Study selection page
- [ ] Chess board for reviewing deviations
- [ ] Basic dashboard

### Quick Testing
- [ ] Basic unit tests for core logic
- [ ] Manual testing workflow

## Phase 2: Make it Fun (Weeks 5-6)
### Learning Features
- [ ] Simple review queue (no complex algorithms yet)
- [ ] Review interface with chess board
- [ ] Basic progress tracking
- [ ] Simple statistics

### Polish
- [ ] Responsive design basics
- [ ] Loading states
- [ ] Error messages that don't suck
- [ ] Demo mode for trying without login

## Phase 3: If We Like It (Future)
### Performance & Scale
- [ ] Database optimization
- [ ] Caching (if needed)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment

### Advanced Features
- [ ] Spaced repetition algorithm
- [ ] Advanced analytics
- [ ] Multiple repertoire support
- [ ] Social features

## Success Milestones (Realistic)
- **Week 1**: Can log in with Lichess and see studies
- **Week 4**: Can detect and review opening deviations
- **Week 6**: Actually fun to use for improving openings
- **Month 3**: Decide if worth taking seriously

## Technology Decisions (Simplified)
- **Database**: Supabase (free tier, managed, easy auth)
- **Backend**: FastAPI (fast to develop, good docs)
- **Frontend**: React + TypeScript (familiar, good ecosystem)
- **Deployment**: Vercel/Netlify for frontend, Railway/Render for backend
- **No Docker** (for now)
- **No CI/CD** (manual deployment is fine)
- **No complex monitoring** (basic logging + Supabase dashboard)