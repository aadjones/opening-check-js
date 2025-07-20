# Frontend Test Suite

This directory contains comprehensive tests for the chess frontend application.

## Test Coverage

### ✅ Active Tests (60 tests across 15 files)

**Algorithm Tests:**

- `spacedRepetition.test.ts` - Core spaced repetition algorithms (SM2+, Basic) - 17 tests
- `basicSpacedRep.test.ts` - Basic spaced repetition logic - 9 tests

**Component Tests:**

- `GamesList.test.tsx` - Games list component - 7 tests
- `useSupabaseSession.test.tsx` - Supabase session hook - 5 tests
- `pkce.test.ts` - PKCE authentication - 5 tests
- `supabaseJWT.test.ts` - JWT handling - 4 tests
- `png.test.ts` - PNG utilities - 4 tests
- `useDeviations.test.tsx` - Deviations hook - 2 tests
- `DeviationCard.test.tsx` - Deviation card component - 1 test
- `Layout.test.tsx` - Layout component - 1 test
- `studyValidation.test.ts` - Study validation - 1 test
- `config.test.ts` - Configuration - 1 test
- `micro.test.ts` - Micro utilities - 1 test
- `simple.test.ts` - Simple validation - 1 test
- Root test files for basic validation

### ❌ Excluded Tests

The following tests are excluded from the test suite because they require external dependencies:

- `supabase-integration.test.ts` - Requires live Supabase connection and environment variables
- `dbSchema.test.ts` - Requires database connection for schema validation
- `spacedRepetitionService.test.ts` - Removed due to complex Supabase mocking requirements

### Test Configuration

Tests are configured in `vitest.config.ts` with:

- 10-second timeouts for reliable CI/CD
- jsdom environment for React component testing
- Automatic exclusion of external dependency tests
- Proper cleanup and isolation between tests

### Running Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test filename.test.ts
```

### Philosophy

This test suite focuses on:

1. **Pure business logic** - Algorithms and utilities that work in any environment
2. **Component behavior** - UI components with proper mocking
3. **Fast execution** - No external dependencies that slow down testing
4. **Reliability** - Tests that pass consistently in any environment

External integrations (database, APIs) are tested through other means like manual testing or dedicated integration test environments.
