# Backend Code Audit – 30 Jun 2025

_Audit of `chess_backend/` directory for stale code, loose ends, complexity, and rule compliance._

---

## 1. Stale Code, Loose Ends, and TODOs

- **TODOs/Loose Ends**
  - `main.py`: `/api/deviations` endpoint has a TODO: _Replace user_id query param with extraction from authentication context (JWT/session) for production security._ This is a real loose end—currently, user_id is passed as a query param, not extracted from a JWT.
  - No other major TODOs, "unfinished," or "deprecated" comments found in the main code.

- **Debug/Print Statements**
  - `pgn_utils.py`, `repertoire_trie.py`, and `tests/test_repertoire_trie.py` have print statements for debugging and test fixture building. These are not harmful but could be cleaned up or replaced with logging if needed.
  - `analysis_service.py` and `lichess_api.py` use logging, not print, which is good.

- **Auto-generated/Temporary Code**
  - `scripts/gen_pydantic_from_supabase.py` is a utility for generating models, not part of runtime code.

---

## 2. Large/Complex Files

- **main.py** (281 lines), **supabase_client.py** (270 lines), and **analysis_service.py** (144 lines) are the largest files.
  - `main.py` is the FastAPI entrypoint and could be split if it grows, but 281 lines is not excessive.
  - `supabase_client.py` is a bit long for a DB client; could be split into user, deviation, and admin logic if it grows further.
  - `analysis_service.py` is a core logic file but is well-structured.
- No files are "monolithic" or obviously in need of urgent refactoring.

---

## 3. Rule Violations

- **Type Safety**: All FastAPI endpoints and models use Pydantic and type annotations.
- **Error Handling**: Uses `HTTPException` and centralized error handling (`error_handling.py`).
- **Supabase Usage**: Uses environment variables and dependency injection for Supabase config.
- **Authentication**: JWT extraction is a TODO in `main.py` (see above).
- **Testing**: There are tests for all major modules (see `tests/`).

---

## 4. Unused/Dead Code

- No obviously unused files or dead code found in the main modules.
- Some test fixtures and debug prints could be cleaned up, but nothing major.

---

## 5. Quick Wins for Simplification/Deletion

- Remove or convert print statements in production code to logging.
- Consider deleting or archiving any scripts/utilities that are no longer used (none found so far).
- The `/api/deviations` endpoint should be updated to extract user_id from JWT, not query param.

---

## 6. Opportunities for Refactoring

- If `main.py` or `supabase_client.py` grow further, consider splitting into routers/modules.
- No urgent need for refactoring at current size.

---

## TL;DR

- No major dead code or stale files.
- One real loose end: `/api/deviations` should extract user_id from JWT, not query param.
- Some debug print statements in utility and test code.
- No urgent refactors needed, but monitor file size in `main.py` and `supabase_client.py`.
- All workspace rules are followed except for the authentication TODO. 