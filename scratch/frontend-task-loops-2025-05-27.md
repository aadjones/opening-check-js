# Frontend Architecture Task Loops - May 27, 2025

## Overview
Breaking down the OutOfBook frontend architecture into small, isolated, testable task loops. Each task should be completable in 1-2 hours and have clear success criteria.

## Task Loop Categories
- **SETUP**: Infrastructure and tooling
- **AUTH**: Authentication and user management  
- **ROUTING**: Navigation and page structure
- **COMPONENTS**: Reusable UI components
- **PAGES**: Full page implementations
- **INTEGRATION**: API and data flow
- **POLISH**: UX improvements and testing

---

## Phase 1: Foundation (Tasks 1-8)

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

### Task 4: AUTH - Install and Configure Supabase Auth
- [ ] **Goal**: Set up authentication infrastructure
- [ ] **Files**: `src/lib/supabase.ts`, `src/contexts/AuthContext.tsx`
- [ ] **Success Criteria**:
  - [ ] Supabase client configured
  - [ ] Auth context provides user state
  - [ ] Login/logout functions available
- [ ] **Tests**: Auth context state management
- [ ] **Estimated Time**: 1 hour

### Task 5: COMPONENTS - Create Protected Route Component
- [ ] **Goal**: Route wrapper that requires authentication
- [ ] **Files**: `src/components/ProtectedRoute.tsx`
- [ ] **Success Criteria**:
  - [ ] Redirects unauthenticated users to landing
  - [ ] Passes through authenticated users
  - [ ] Shows loading state during auth check
- [ ] **Tests**: Authentication flow scenarios
- [ ] **Estimated Time**: 45 minutes

### Task 6: PAGES - Create Landing Page
- [ ] **Goal**: Marketing page with OAuth login
- [ ] **Files**: `src/pages/LandingPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Matches PRD wireframe design
  - [ ] "Connect with Lichess" button
  - [ ] Demo mode link
  - [ ] Responsive design
- [ ] **Tests**: Component rendering and button interactions
- [ ] **Estimated Time**: 1.5 hours

### Task 7: PAGES - Create Onboarding Flow
- [ ] **Goal**: Study selection after login
- [ ] **Files**: `src/pages/OnboardingPage.tsx`, `src/components/StudySelector.tsx`
- [ ] **Success Criteria**:
  - [ ] Study URL input fields (White/Black)
  - [ ] Validation for Lichess study URLs
  - [ ] "Start Tracking" button
  - [ ] Saves to user profile
- [ ] **Tests**: Form validation and submission
- [ ] **Estimated Time**: 2 hours

### Task 8: SETUP - Create Custom Hooks for API Calls
- [ ] **Goal**: Reusable data fetching patterns
- [ ] **Files**: `src/hooks/useAuth.ts`, `src/hooks/useDeviations.ts`
- [ ] **Success Criteria**:
  - [ ] useAuth hook for authentication state
  - [ ] useDeviations hook for fetching user deviations
  - [ ] Proper loading/error states
- [ ] **Tests**: Hook behavior with mocked API responses
- [ ] **Estimated Time**: 1 hour

---

## Phase 2: Core Functionality (Tasks 9-15)

### Task 9: PAGES - Create Dashboard Page Structure
- [ ] **Goal**: Main dashboard layout without data
- [ ] **Files**: `src/pages/DashboardPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Recent deviations section
  - [ ] Games list section  
  - [ ] Filter controls section
  - [ ] Responsive grid layout
- [ ] **Tests**: Layout rendering and responsiveness
- [ ] **Estimated Time**: 1 hour

### Task 10: COMPONENTS - Create Deviation Summary Card
- [ ] **Goal**: Compact deviation display for dashboard
- [ ] **Files**: `src/components/DeviationCard.tsx`
- [ ] **Success Criteria**:
  - [ ] Shows game info, opponent, deviation move
  - [ ] Click navigates to detail page
  - [ ] Proper TypeScript interfaces
- [ ] **Tests**: Card rendering with different data states
- [ ] **Estimated Time**: 1 hour

### Task 11: COMPONENTS - Create Games List Component
- [ ] **Goal**: Recent games with deviation status
- [ ] **Files**: `src/components/GamesList.tsx`
- [ ] **Success Criteria**:
  - [ ] Shows recent games (with/without deviations)
  - [ ] Game result, time control, opponent
  - [ ] Links to Lichess game
- [ ] **Tests**: List rendering and interaction
- [ ] **Estimated Time**: 1 hour

### Task 12: COMPONENTS - Migrate Existing Chess Board
- [ ] **Goal**: Extract and enhance current DeviationDisplay
- [ ] **Files**: `src/components/ChessBoard.tsx`, `src/components/MoveNavigation.tsx`
- [ ] **Success Criteria**:
  - [ ] Reusable chess board component
  - [ ] Move navigation controls
  - [ ] Arrow highlighting for moves
  - [ ] Maintains existing functionality
- [ ] **Tests**: Board state management and navigation
- [ ] **Estimated Time**: 2 hours

### Task 13: PAGES - Create Deviation Detail Page
- [ ] **Goal**: Full deviation review interface
- [ ] **Files**: `src/pages/DeviationDetailPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Uses migrated chess board component
  - [ ] Shows played vs expected moves
  - [ ] Action buttons (Mark Reviewed, etc.)
  - [ ] Matches PRD wireframe
- [ ] **Tests**: Page functionality and user interactions
- [ ] **Estimated Time**: 2 hours

### Task 14: INTEGRATION - Connect Dashboard to Real Data
- [ ] **Goal**: Wire dashboard to Supabase data
- [ ] **Files**: Update dashboard components
- [ ] **Success Criteria**:
  - [ ] Fetches user's actual deviations
  - [ ] Shows loading states
  - [ ] Handles empty states gracefully
- [ ] **Tests**: Data loading scenarios
- [ ] **Estimated Time**: 1.5 hours

### Task 15: COMPONENTS - Create Filter Controls
- [ ] **Goal**: Time control and date filtering
- [ ] **Files**: `src/components/FilterControls.tsx`
- [ ] **Success Criteria**:
  - [ ] Time control toggles (Bullet/Blitz/Rapid)
  - [ ] Date range picker
  - [ ] Updates dashboard data
- [ ] **Tests**: Filter state management
- [ ] **Estimated Time**: 1.5 hours

---

## Phase 3: Polish & Enhancement (Tasks 16-20)

### Task 16: PAGES - Create Settings Page
- [ ] **Goal**: User preferences and notifications
- [ ] **Files**: `src/pages/SettingsPage.tsx`
- [ ] **Success Criteria**:
  - [ ] Email notification preferences
  - [ ] Study management
  - [ ] Account settings
- [ ] **Tests**: Settings persistence
- [ ] **Estimated Time**: 2 hours

### Task 17: COMPONENTS - Add Loading States
- [ ] **Goal**: Consistent loading UX across app
- [ ] **Files**: `src/components/LoadingSpinner.tsx`, update all pages
- [ ] **Success Criteria**:
  - [ ] Skeleton loading for lists
  - [ ] Spinner for actions
  - [ ] Consistent styling
- [ ] **Tests**: Loading state rendering
- [ ] **Estimated Time**: 1 hour

### Task 18: COMPONENTS - Add Error Boundaries
- [ ] **Goal**: Graceful error handling
- [ ] **Files**: `src/components/ErrorBoundary.tsx`
- [ ] **Success Criteria**:
  - [ ] Catches component errors
  - [ ] Shows user-friendly error messages
  - [ ] Provides recovery options
- [ ] **Tests**: Error boundary behavior
- [ ] **Estimated Time**: 45 minutes

### Task 19: POLISH - Add Page Transitions
- [ ] **Goal**: Smooth navigation experience
- [ ] **Files**: Add Framer Motion, update router
- [ ] **Success Criteria**:
  - [ ] Smooth page transitions
  - [ ] Loading animations
  - [ ] Maintains accessibility
- [ ] **Tests**: Animation performance
- [ ] **Estimated Time**: 1.5 hours

### Task 20: INTEGRATION - Add Real-time Updates
- [ ] **Goal**: Live deviation notifications
- [ ] **Files**: `src/hooks/useRealtimeDeviations.ts`
- [ ] **Success Criteria**:
  - [ ] Supabase real-time subscriptions
  - [ ] Dashboard updates automatically
  - [ ] Notification system
- [ ] **Tests**: Real-time data flow
- [ ] **Estimated Time**: 2 hours

---

## Testing Strategy

### Unit Tests (Per Task)
- [ ] Component rendering
- [ ] Hook behavior
- [ ] Utility functions
- [ ] Form validation

### Integration Tests (After Phases)
- [ ] Authentication flow
- [ ] Data fetching and caching
- [ ] Route navigation
- [ ] User workflows

### E2E Tests (Final)
- [ ] Complete user journey
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

---

## Success Metrics

### Phase 1 Complete
- [ ] User can log in with Lichess
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

## Notes

- Each task should be in its own branch
- All tasks include TypeScript interfaces
- Maintain existing CSS styling approach
- Focus on functionality over visual polish initially
- Can parallelize some tasks after Phase 1 