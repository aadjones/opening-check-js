# OutOfBook Revised Implementation Plan

## Overview
Breaking down the remaining work into small, isolated, testable task loops. Each task should be completable in 1-2 hours and have clear success criteria. This plan focuses on wiring up the existing frontend components and implementing the backend functionality described in the revised vision.

## Architecture Decision: Sync System
**Status**: Accepted - [Current Date]

**Key Changes**:
- Implement timestamp-based game syncing
- Add review status tracking
- Add basic insights generation
- Add prep score tracking
- Add simple sync preferences

## Task Loop Categories
- **BACKEND**: Server and database functionality
- **SYNC**: Game synchronization system
- **INTEGRATION**: Connecting frontend to backend
- **DATA**: Data models and transformations

---

## Phase 1: Backend Foundation (Tasks 1-4)

### Task 1: BACKEND - Update Database Schema
- [X] **Goal**: Add essential tables and columns for sync system
- [X] **Files**: Database migration
- [X] **Changes Needed**:
  - [X] Add `last_synced_at` to profiles
  - [X] Add `review_status` to deviations table
  - [X] Add `sync_preferences` table (frequency only)
- [X] **Success Criteria**: 
  - [X] All new tables created
  - [X] RLS policies updated
  - [X] TypeScript types generated
- [X] **Tests**: Schema validation
- [X] **Estimated Time**: 1 hour

### Task 2: BACKEND - Implement Sync System Core
- [X] **Goal**: Create base sync system following architecture.md
- [X] **Files**: `supabase/functions/sync-games.ts`
- [X] **Success Criteria**:
  - [X] Fetches games since last_synced_at
  - [X] Handles batch processing (50 games max)
  - [X] Updates sync timestamps
  - [X] Basic rate limit handling
- [X] **Tests**: Sync functionality with mock data
- [X] **Estimated Time**: 2 hours

### Task 3: BACKEND - Add Review Status System
- [X] **Goal**: Implement basic review status tracking
- [X] **Files**: `supabase/functions/update-review-status.ts`
- [X] **Success Criteria**:
  - [X] API endpoint for updating status
  - [X] Basic status transitions (Needs Review → Reviewed/Adopted/Ignored)
  - [X] RLS policies for status updates
- [X] **Tests**: Status update flows
- [X] **Estimated Time**: 1 hour

### Task 4: BACKEND - Add Basic Prep Score
- [X] **Goal**: Implement simple prep score tracking
- [X] **Files**: `supabase/functions/calculate-prep-score.ts`
- [X] **Success Criteria**:
  - [X] Calculates weekly scores (held prep vs deviations)
  - [X] Updates scores on new games
  - [X] Basic score display
- [X] **Tests**: Score calculation logic
- [X] **Estimated Time**: 1 hour

---

## Phase 2: Frontend Integration (Tasks 5-8)

### Task 5: INTEGRATION - Connect Dashboard to Real Data
- [X] **Goal**: Wire up dashboard components to backend (backend logic and schema for deviation tracking complete)
- [ ] **Files**: Update dashboard components
- [X] **Success Criteria**:
  - [X] Backend deviation logic robust and testable (pure logic tests passing)
  - [X] Database schema supports both user and opponent deviations
  - [ ] LastGameSummaryWidget shows real data
  - [ ] PrepScoreWidget displays current scores
  - [ ] GamesList shows real games with status
- [X] **Tests**: Pure logic tests for deviation detection
- [ ] **Estimated Time**: 2 hours

### Task 6: INTEGRATION - Implement Review Queue
- [ ] **Goal**: Connect review queue to backend
- [ ] **Files**: Update review queue components
- [ ] **Success Criteria**:
  - [ ] Shows unresolved deviations
  - [ ] Status updates work
  - [ ] Basic actions (Review/Adopt/Ignore) connected
- [ ] **Tests**: Review flow and status updates
- [ ] **Estimated Time**: 1.5 hours

### Task 7: INTEGRATION - Add Basic Sync Controls
- [ ] **Goal**: Connect sync settings to backend
- [ ] **Files**: Update settings components
- [ ] **Success Criteria**:
  - [ ] Sync frequency settings work
  - [ ] Manual sync button functional
  - [ ] Basic sync status display
- [ ] **Tests**: Settings persistence
- [ ] **Estimated Time**: 1 hour

### Task 8: INTEGRATION - Wire Up Deviation Page
- [ ] **Goal**: Connect deviation detail page
- [ ] **Files**: Update deviation page components
- [ ] **Success Criteria**:
  - [ ] Shows real deviation data
  - [ ] Chessboard works with real moves
  - [ ] Basic resolution actions connected
- [ ] **Tests**: Deviation display and actions
- [ ] **Estimated Time**: 1.5 hours

---

## Phase 3: Essential Polish (Tasks 9-10)

### Task 9: POLISH - Add Basic Error Handling
- [ ] **Goal**: Implement essential error handling
- [ ] **Files**: Add error boundaries, update components
- [ ] **Success Criteria**:
  - [ ] Sync error handling
  - [ ] Basic API error handling
  - [ ] User-friendly error messages
- [ ] **Tests**: Error scenarios
- [ ] **Estimated Time**: 1 hour

### Task 10: POLISH - Add Loading States
- [ ] **Goal**: Implement essential loading states
- [ ] **Files**: Update components
- [ ] **Success Criteria**:
  - [ ] Loading indicators for sync
  - [ ] Basic loading states for lists
  - [ ] Action loading states
- [ ] **Tests**: Loading state behavior
- [ ] **Estimated Time**: 1 hour

---

## Success Metrics

### Phase 1 Complete
- [X] Sync system works reliably
- [X] Review status system functional
- [X] Prep scores calculated correctly

### Phase 2 Complete
- [ ] Dashboard shows real data
- [ ] Review queue functional
- [ ] Basic sync controls working
- [ ] Deviation page complete

### Phase 3 Complete
- [ ] Basic error handling in place
- [ ] Loading states implemented
- [ ] Core functionality tested

---

## Environment Variables Required

```ini
# Sync System
LICHESS_API_RATE_LIMIT=60
SYNC_BATCH_SIZE=50
SYNC_DEFAULT_INTERVAL=3600

# Testing
TEST_LICHESS_USERNAME=<<test_account>>
TEST_LICHESS_TOKEN=<<test_token>>
```

---

## Future Enhancements (Post-MVP)
- Advanced insights generation
- Real-time updates beyond basic sync
- Comprehensive analytics
- Performance optimization
- Enhanced sync preferences (quiet hours, etc.)
- Advanced prep score features

---

## Notes

- Each task should be in its own branch
- Focus on core functionality first
- Keep implementations simple
- Add tests as features are implemented
- Monitor sync system performance
- Consider rate limits in sync operations 