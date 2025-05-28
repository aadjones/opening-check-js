# OutOfBook Frontend Refactor — Plain‑English Roadmap  
*(medium / high‑level summary of the Cursor task loops, 27 May 2025)*

---

## 0. Big Picture

| Question | Plain answer |
| --- | --- |
| **What’s the end goal?** | A React/Vite client that logs you in with **one Lichess button**, pulls your chess “deviations” from Supabase, and shows them in a clean dashboard. |
| **Why the rewrite?** | Supabase Auth was overkill. We’re **swapping to Auth.js** so we only keep Supabase as a vanilla Postgres + RLS store. No more client secrets, easier tokens, cleaner code. |
| **How’s the work sliced?** | Three phases of ~1‑2 hour “task loops.” Each loop has tests and clear done criteria so we never sit on half‑finished glue code. |

---

## 1. Core Architecture Change (already accepted)

* **Auth.js (aka NextAuth) + Lichess OAuth 2.0 (PKCE)**  
  *One identity provider, no secrets to leak.*  
* **Custom JWT signer**  
  We mint a JWT that Supabase trusts, so RLS still guards rows per user.  
* **Supabase = database only**  
  All auth UI bits disappear; we keep Postgres and the realtime channel.  

***Hidden gotcha:** test the custom‐signed JWT with RLS **early**—if the claim names are wrong, you’ll be locked out of data and wondering why.*

---

## 2. Phase 1 — “Lay the Rails”  

1. **Routing & Layout (Tasks 1‑3)**  
   *React Router v6, skeleton pages, shared header.*  
2. **Auth Plumb‑in (Tasks 4, 4b, 5)**  
   *Add the Lichess provider, PKCE dance, custom JWT helper, a `<ProtectedRoute>` wrapper.*  
3. **First real page (Tasks 6‑9)**  
   *Marketing landing with a “Connect with Lichess” button, an onboarding screen that asks which Lichess Study you’re tracking, hooks to keep Auth.js and Supabase in sync, and a tiny users table migration.*

**Phase‑1 success snapshot**

* You can click “Connect with Lichess,” come back logged in, and see placeholder routes.  
* Supabase rows know who you are (thanks to that JWT).  
* All navigation works—even if it’s just lorem ipsum.

---

## 3. Phase 2 — “Make It Actually Useful”

* **Dashboard skeleton → live data**  
  - Deviation cards, games list, filter controls.  
  - Chess board component extracted and polished.  
* **Detail page** for a single deviation (plays your move vs. prep).  
* **Wiring to Supabase** with Auth.js session in headers so data shows for *you* only.

**Phase‑2 success snapshot**

* Your real‑world “deviate” games populate the dashboard.  
* You can click a game, replay the missed line, mark it reviewed, filter by blitz/rapid, etc.

---

## 4. Phase 3 — “Feel Good & Don’t Crash”

* **Settings page** (email prefs, study links, display username).  
* **UX polish** – loaders, skeletons, framer‑motion page transitions.  
* **Error boundaries** – no more white screens of death.  
* **Realtime updates** – Supabase channel pushes new deviations without refresh.  

**Phase‑3 success snapshot**

* The app looks finished, handles slow networks gracefully, and live‑updates when a fresh game lands on Lichess.

---

## 5. Test Strategy Cheatsheet

| Scope | What we test | When |
| --- | --- | --- |
| **Unit** | Components, hooks, helpers, JWT signer | Each task loop |
| **Integration** | Login flow, RLS queries, route guards | After each phase |
| **E2E** | Full “log in → play a game → see deviation” journey on desktop & mobile | Final polish |

