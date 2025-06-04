# Frontend Architecture Task Loops - May 27, 2025

## Overview
Breaking down the OutOfBook frontend architecture into small, isolated, testable task loops. Each task should be completable in 1-2 hours and have clear success criteria.

## Architecture Decision: Auth.js + Lichess OAuth
**Status**: Accepted - 27 May 2025

**Key Changes**:
- Auth.js (NextAuth) replaces Supabase Auth for authentication
- Lichess OAuth 2.0 with PKCE as sole identity provider
- Supabase remains as Postgres-only database
- Custom JWT signing for Supabase RLS compatibility
- No client secrets required, PKCE mandatory

## Task Loop Categories
- **SETUP**: Infrastructure and tooling
- **AUTH**: Authentication and user management  
- **ROUTING**: Navigation and page structure
- **COMPONENTS**: Reusable UI components
- **PAGES**: Full page implementations
- **INTEGRATION**: API and data flow
- **POLISH**: UX improvements and testing

---

## Phase 1: Foundation (Tasks 1-9)

### Task 1: SETUP - Install and Configure React Router
- [x] **Goal**: Add client-side routing capability
- [x] **Files**: `package.json`, `src/main.tsx`
- [x] **Success Criteria**: 
  - [x] React Router v6 installed
  - [x] Basic router setup in main.tsx
  - [x] Can navigate between routes programmatically
- [x] **Tests**: Router navigation unit test
- [x] **Estimated Time**: 30 minutes

### Task 2: ROUTING - Create Basic Route Structure  
- [x] **Goal**: Define all main routes with placeholder components
- [x] **Files**: `src/routes/`, `src/App.tsx`
- [x] **Routes to Create**:
  - [x] `/` (Landing)
  - [x] `/onboarding` (Study Selection)
  - [x] `/dashboard` (Main App)
  - [x] `/deviation/:id` (Detail View)
  - [x] `/settings` (User Preferences)
- [x] **Success Criteria**: All routes render placeholder content
- [x] **Tests**: Route rendering tests
- [x] **Estimated Time**: 45 minutes

### Task 3: COMPONENTS - Create Layout Component
- [x] **Goal**: Shared layout with header/navigation
- [x] **Files**: `src/components/Layout.tsx`
- [x] **Success Criteria**: 
  - [x] Responsive layout component
  - [x] Header with navigation links
  - [x] Proper TypeScript interfaces
- [x] **Tests**: Layout rendering and responsive behavior
- [x] **Estimated Time**: 1 hour

### Task 4: AUTH - Install and Configure Auth.js with Lichess Provider
- [x] **Goal**: Set up Auth.js with custom Lichess OAuth provider
- [x] **Files**: `package.json`, `src/lib/auth/lichess.ts`, `src/lib/auth/config.ts`
- [x] **Success Criteria**:
  - [x] Auth.js (NextAuth) installed
  - [x] Custom Lichess OAuth provider configured
  - [x] PKCE flow implemented (no client secret)
  - [x] Environment variables configured
- [x] **Tests**: OAuth provider configuration
- [x] **Estimated Time**: 1.5 hours

### Task 4b: AUTH - Create JWT Helper for Supabase Compatibility
- [x] **Goal**: Sign custom JWTs for Supabase RLS
- [x] **Files**: `src/lib/auth/supaToken.ts`
- [x] **Success Criteria**:
  - [x] Signs JWTs with supabase_jwt_secret
  - [x] Includes required claims (sub, role, lichess)
  - [x] Compatible with Supabase RLS
  - [x] Sets Supabase session with custom JWT (Frontend ready, pending serverless JWT integration)
- [x] **Tests**: JWT signing and verification
- [x] **Estimated Time**: 1 hour

> **Reminder:** When backend/serverless JWT signing is ready, wire up the real JWT in `syncSupabaseSession` and uncomment the session setting code.

### Task 5: COMPONENTS - Create Protected Route Component
- [x] **Goal**: Route wrapper that requires Auth.js session
- [x] **Files**: `src/components/ProtectedRoute.tsx`
- [x] **Success Criteria**:
  - [x] Uses Auth.js useSession hook
  - [x] Redirects unauthenticated users to landing
  - [x] Shows loading state during session check
  - [x] Sets Supabase session with custom JWT (Frontend ready, pending serverless JWT integration)
- [x] **Tests**: Authentication flow scenarios
- [x] **Estimated Time**: 1 hour

### Task 6: PAGES - Create Landing Page
- [x] **Goal**: Marketing page with Lichess OAuth login
- [x] **Files**: `src/pages/LandingPage.tsx`
- [x] **Success Criteria**:
  - [x] Matches PRD wireframe design (responsive, gradient hero title, feature cards, etc.)
  - [x] "Connect with Lichess" button using Auth.js signIn (via useAuth hook)
  - [x] Demo mode link (to /demo) is present
  - [x] Responsive design (mobile styles in LandingPage.module.css)
- [x] **Tests**: Component rendering and Auth.js integration (via useAuth hook)
- [x] **Estimated Time**: 1.5 hours

### Task 7: PAGES - Create Onboarding Flow
- [x] **Goal**: Study selection after Lichess login
- [x] **Files**: `src/pages/OnboardingPage.tsx`, `src/components/StudySelector.tsx`
- [x] **Success Criteria**:
  - [x] Study URL input fields (White/Black)
  - [x] Validation for Lichess study URLs
  - [x] "Start Tracking" button
  - [x] Saves to user profile in Supabase
- [x] **Tests**: Form validation and submission
- [x] **Estimated Time**: 2 hours

#### Task 7a: COMPONENTS - Create StudySelector Component
- [x] **Goal**: Basic study URL input with validation
- [x] **Files**: `src/components/StudySelector.tsx`
- [x] **Success Criteria**:
  - [x] URL input fields for White/Black studies
  - [x] Basic URL format validation
  - [x] Loading states
  - [x] Error message display
- [x] **Tests**: 
  - [x] URL format validation
  - [x] Component rendering
  - [x] Error state handling
- [x] **Estimated Time**: 45 minutes

#### Task 7b: INTEGRATION - Add Lichess Study Validation
- [x] **Goal**: Verify study access via Lichess API
- [x] **Files**: `src/lib/lichess/studyValidation.ts`
- [x] **Success Criteria**:
  - [x] Study existence check
  - [x] Access verification
  - [x] Error handling
  - [x] Caching strategy
- [x] **Tests**:
  - [x] API integration
  - [x] Error scenarios
  - [x] Cache behavior
- [x] **Estimated Time**: 45 minutes

#### Task 7c: PAGES - Create OnboardingPage
- [x] **Goal**: Study selection page with form
- [x] **Files**: `src/pages/OnboardingPage.tsx`
- [x] **Success Criteria**:
  - [x] Uses StudySelector component
  - [x] Progress indication
  - [x] Help text
  - [x] Demo option (loads demo studies for current user)
  - [x] Integrates with onboarding flow (first-time user detection)
  - [x] Saves study selections and redirects to dashboard
- [x] **Tests**:
  - [x] Page rendering
  - [x] Form submission
  - [x] Navigation
  - [x] Demo mode functionality
- [x] **Estimated Time**: 30 minutes

#### Task 7d: INTEGRATION - Connect to Supabase
- [x] **Goal**: Save study selections to user profile
- [x] **Files**: Update OnboardingPage
- [x] **Success Criteria**:
  - [x] Save study IDs to user profile
  - [x] Handle save errors
  - [x] Redirect after success
- [x] **Tests**:
  - [x] Database operations
  - [x] Error handling
  - [x] Success flow
- [x] **Estimated Time**: 30 minutes

### Task 8: SETUP - Create Custom Hooks for Auth.js Integration
- [x] **Goal**: Reusable patterns for Auth.js + Supabase
- [x] **Files**: `src/hooks/useAuth.ts`, `src/hooks/useSupabaseSession.ts`, `src/hooks/useDeviations.ts`
- [x] **Success Criteria**:
  - [x] useAuth hook wrapping Auth.js useSession
  - [x] useSupabaseSession hook for RLS-compatible sessions
  - [x] useDeviations hook for fetching user deviations
  - [x] Proper loading/error states
- [x] **Tests**: Hook behavior with mocked sessions
- [x] **Estimated Time**: 1.5 hours

### Task 9: SETUP - Update Database Schema for Auth.js
- [x] **Goal**: Create users table compatible with Auth.js
- [x] **Files**: Database migration, `src/lib/database.types.ts`
- [x] **Success Criteria**:
  - [x] Users table with lichess_username, access_token fields
  - [x] RLS policies updated for new JWT structure
  - [x] TypeScript types generated
- [x] **Tests**: Database schema validation
- [x] **Estimated Time**: 1 hour

### Task 9.5: BACKEND - Lichess Game Ingestion & Deviation Analysis
- [ ] **Goal**: Automatically fetch recent Lichess games, analyze for deviations, and insert results into Supabase for the authenticated user.
- [ ] **Files**: `supabase/functions/analyzeGames.ts`, `supabase/functions/utils/lichess.ts`, `supabase/functions/utils/deviation.ts`
- [ ] **Subtasks**:
  - [ ] **Ingestion Function**: Create a Supabase Edge Function (or serverless function) to fetch recent games for a user from Lichess.
  - [ ] **Deviation Analysis**: Implement logic to compare games against user studies and detect deviations.
  - [ ] **Database Insert**: Insert detected deviations into the `opening_deviations` table, linked to the correct user.
  - [ ] **Triggering**: Allow the function to be triggered manually (API call) and/or on a schedule (cron).
  - [ ] **Error Handling**: Handle API errors, rate limits, and duplicate game detection.
  - [ ] **Testing**: End-to-end test with a real Lichess account and Supabase project.
- [ ] **Success Criteria**:
  - [ ] Function can be triggered for a user and processes their recent games.
  - [ ] Deviations are correctly inserted into Supabase and visible in the dashboard.
  - [ ] Handles duplicate games gracefully (no double-inserts).
  - [ ] Logs errors and successes for debugging.
- [ ] **Estimated Time**: 2-3 hours

---

## Phase 2: Core Functionality (Tasks 10-16)

### Task 10: PAGES - Create Dashboard Page Structure
- [ ] **Goal**: Main dashboard layout without data
- [ ] **Files**: `src/pages/DashboardPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Recent deviations section
  - [ ] Games list section  
  - [ ] Filter controls section
  - [ ] Responsive grid layout
- [ ] **Tests**: Layout rendering and responsiveness
- [ ] **Estimated Time**: 1 hour

### Task 11: COMPONENTS - Create Deviation Summary Card
- [ ] **Goal**: Compact deviation display for dashboard
- [ ] **Files**: `src/components/DeviationCard.tsx`
- [ ] **Success Criteria**:
  - [ ] Shows game info, opponent, deviation move
  - [ ] Click navigates to detail page
  - [ ] Proper TypeScript interfaces
- [ ] **Tests**: Card rendering with different data states
- [ ] **Estimated Time**: 1 hour

### Task 12: COMPONENTS - Create Games List Component
- [ ] **Goal**: Recent games with deviation status
- [ ] **Files**: `src/components/GamesList.tsx`
- [ ] **Success Criteria**:
  - [ ] Shows recent games (with/without deviations)
  - [ ] Game result, time control, opponent
  - [ ] Links to Lichess game
- [ ] **Tests**: List rendering and interaction
- [ ] **Estimated Time**: 1 hour

### Task 13: COMPONENTS - Migrate Existing Chess Board
- [ ] **Goal**: Extract and enhance current DeviationDisplay
- [ ] **Files**: `src/components/ChessBoard.tsx`, `src/components/MoveNavigation.tsx`
- [ ] **Success Criteria**:
  - [ ] Reusable chess board component
  - [ ] Move navigation controls
  - [ ] Arrow highlighting for moves
  - [ ] Maintains existing functionality
- [ ] **Tests**: Board state management and navigation
- [ ] **Estimated Time**: 2 hours

### Task 14: PAGES - Create Deviation Detail Page
- [ ] **Goal**: Full deviation review interface
- [ ] **Files**: `src/pages/DeviationDetailPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Uses migrated chess board component
  - [ ] Shows played vs expected moves
  - [ ] Action buttons (Mark Reviewed, etc.)
  - [ ] Matches PRD wireframe
- [ ] **Tests**: Page functionality and user interactions
- [ ] **Estimated Time**: 2 hours

### Task 15: INTEGRATION - Connect Dashboard to Real Data
- [ ] **Goal**: Wire dashboard to Supabase data with Auth.js sessions
- [ ] **Files**: Update dashboard components
- [ ] **Success Criteria**:
  - [ ] Fetches user's actual deviations using RLS
  - [ ] Shows loading states
  - [ ] Handles empty states gracefully
  - [ ] Proper error handling for auth failures
- [ ] **Tests**: Data loading scenarios with auth
- [ ] **Estimated Time**: 1.5 hours

### Task 16: COMPONENTS - Create Filter Controls
- [ ] **Goal**: Time control and date filtering
- [ ] **Files**: `src/components/FilterControls.tsx`
- [ ] **Success Criteria**:
  - [ ] Time control toggles (Bullet/Blitz/Rapid)
  - [ ] Date range picker
  - [ ] Updates dashboard data
- [ ] **Tests**: Filter state management
- [ ] **Estimated Time**: 1.5 hours

---

## Phase 3: Polish & Enhancement (Tasks 17-22)

### Task 17: PAGES - Create Settings Page
- [ ] **Goal**: User preferences and notifications
- [ ] **Files**: `src/pages/SettingsPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Email notification preferences
  - [ ] Study management
  - [ ] Account settings with Lichess username display
- [ ] **Tests**: Settings persistence
- [ ] **Estimated Time**: 2 hours

### Task 18: COMPONENTS - Add Loading States
- [ ] **Goal**: Consistent loading UX across app
- [ ] **Files**: `src/components/LoadingSpinner.tsx`, update all pages
- [ ] **Success Criteria**:
  - [ ] Skeleton loading for lists
  - [ ] Spinner for actions
  - [ ] Consistent styling
- [ ] **Tests**: Loading state rendering
- [ ] **Estimated Time**: 1 hour

### Task 19: COMPONENTS - Add Error Boundaries
- [ ] **Goal**: Graceful error handling
- [ ] **Files**: `src/components/ErrorBoundary.tsx`
- [ ] **Success Criteria**:
  - [ ] Catches component errors
  - [ ] Shows user-friendly error messages
  - [ ] Provides recovery options
- [ ] **Tests**: Error boundary behavior
- [ ] **Estimated Time**: 45 minutes

### Task 20: AUTH - Add Session Management
- [ ] **Goal**: Handle Auth.js session lifecycle
- [ ] **Files**: `src/components/SessionProvider.tsx`, update App.tsx
- [ ] **Success Criteria**:
  - [ ] Wraps app with Auth.js SessionProvider
  - [ ] Handles session refresh
  - [ ] Manages Supabase session sync
- [ ] **Tests**: Session lifecycle management
- [ ] **Estimated Time**: 1 hour

### Task 21: POLISH - Add Page Transitions
- [ ] **Goal**: Smooth navigation experience
- [ ] **Files**: Add Framer Motion, update router
- [ ] **Success Criteria**:
  - [ ] Smooth page transitions
  - [ ] Loading animations
  - [ ] Maintains accessibility
- [ ] **Tests**: Animation performance
- [ ] **Estimated Time**: 1.5 hours

### Task 22: INTEGRATION - Add Real-time Updates
- [ ] **Goal**: Live deviation notifications
- [ ] **Files**: `src/hooks/useRealtimeDeviations.ts`
- [ ] **Success Criteria**:
  - [ ] Supabase real-time subscriptions with RLS
  - [ ] Dashboard updates automatically
  - [ ] Notification system
- [ ] **Tests**: Real-time data flow with auth
- [ ] **Estimated Time**: 2 hours

---

## Environment Variables Required

```ini
# Auth.js Configuration
LICHESS_CLIENT_ID=<<our registered app id>>
NEXTAUTH_SECRET=<<random 32+ char string>>
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration (Database Only)
SUPABASE_URL=<<project url>>
SUPABASE_ANON_KEY=<<anon key>>
SUPABASE_JWT_SECRET=<<from project settings>>
```

---

## Testing Strategy

### Unit Tests (Per Task)
- [ ] Component rendering
- [ ] Hook behavior
- [ ] Utility functions
- [ ] Form validation
- [ ] JWT signing/verification

### Integration Tests (After Phases)
- [ ] Auth.js + Lichess OAuth flow
- [ ] Supabase RLS with custom JWTs
- [ ] Data fetching and caching
- [ ] Route navigation with auth
- [ ] User workflows

### E2E Tests (Final)
- [ ] Complete user journey with Lichess login
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Session persistence

---

## Success Metrics

### Phase 1 Complete
- [ ] User can log in with Lichess OAuth
- [ ] Auth.js sessions work with Supabase RLS
- [ ] User can select studies
- [ ] All routes are accessible
- [ ] Basic navigation works

### Phase 2 Complete  
- [ ] Dashboard shows real deviation data
- [ ] User can review individual deviations
- [ ] Chess board functionality works
- [ ] Filtering and search work

### Phase 3 Complete
- [ ] App feels polished and responsive
- [ ] Error handling is robust
- [ ] Real-time updates work
- [ ] Ready for user testing

---

## Migration Notes

### Removed Dependencies
- [ ] Remove `@supabase/auth-helpers-react`
- [ ] Remove Supabase Auth UI components

### Added Dependencies
- [ ] Add `next-auth` (Auth.js)
- [ ] Add `jsonwebtoken` for JWT signing
- [ ] Add `@types/jsonwebtoken`

### Architecture Benefits
- **Simplified Auth Flow**: Single OAuth provider reduces user friction
- **No Secrets Management**: PKCE eliminates need for client secrets
- **Supabase RLS**: Still get database-level security with custom JWTs
- **Long-lived Tokens**: 1-year Lichess tokens reduce re-auth frequency

---

## Notes

- Each task should be in its own branch
- All tasks include TypeScript interfaces
- Maintain existing CSS styling approach
- Focus on functionality over visual polish initially
- Can parallelize some tasks after Phase 1
- Test JWT compatibility with Supabase RLS thoroughly 