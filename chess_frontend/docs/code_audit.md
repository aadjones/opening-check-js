# Frontend Code Audit – 30 Jun 2025

_Audit of `chess_frontend/` directory for stale code, loose ends, complexity, and rule compliance._

---

## 1. Stale Code, Loose Ends, and TODOs

- **TODOs/Loose Ends**
  - `src/hooks/useDeviations.ts`: TODO to remove the `user_id` param when backend auth is ready. This is a real loose end, mirroring the backend.
  - No other major TODOs, "unfinished," or "deprecated" comments found in the main code.

- **Feature Flags**
  - `src/featureFlags.ts`: Several review queue features are marked as "currently broken, do not enable." These are not dead code, but indicate unfinished or experimental features.

- **Debug/Print Statements**
  - `src/contexts/StudyUpdateContext.tsx` and `src/contexts/useStudyUpdate.ts` have `console.log` statements for development.
  - `src/hooks/useDeviations.ts` uses `console.log` and `console.error` for debugging.
  - These are not harmful but could be cleaned up or replaced with proper logging if needed.

- **Development/Temporary Styles**
  - `src/styles/base.css`: `.dev` class and marker for development, easy to remove later.

- **Development Helpers**
  - `src/lib/auth/onboardingUtils.ts`: Exposes helpers to `window` in dev mode for testing.

---

## 2. Large/Complex Files

- No single file stands out as "monolithic" or in urgent need of refactoring.
- Most logic is split into small, focused files and React components.
- `App.tsx` (105 lines) and main hooks/components are all reasonable in size.

---

## 3. Rule Violations

- **Type Safety**: TypeScript is used throughout, with types/interfaces for hooks, context, and components.
- **Styling**: CSS Modules are used for all styles; no global or inline styles except for a few utility classes in `base.css`.
- **Testing**: There are tests for key hooks and components in `src/test/`.
- **Chess Features**: Uses `react-chessboard` and `chess.js` for chess logic/UI.
- **Supabase Usage**: Uses environment variables and client libraries for DB/auth.

---

## 4. Unused/Dead Code

- No obviously unused files or dead code found in the main modules.
- Some feature flags and dev helpers are present but not harmful.

---

## 5. Quick Wins for Simplification/Deletion

- Remove or convert `console.log`/`console.error` in production code to proper logging or remove entirely.
- Remove `.dev` class from `base.css` if no longer needed.
- Remove or archive any feature flags/features that are permanently abandoned (none found so far).
- Remove dev helpers from `window` if not needed.

---

## 6. Opportunities for Refactoring

- No urgent need for refactoring at current size.
- If any hooks or components grow significantly, consider splitting further.

---

## TL;DR

- No major dead code or stale files.
- One real loose end: `useDeviations` should remove `user_id` param when backend auth is ready.
- Some debug/dev code (`console.log`, `.dev` class, dev helpers) could be cleaned up.
- No urgent refactors needed; codebase is modular and follows workspace rules.
