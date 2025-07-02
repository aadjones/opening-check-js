# lib/

Wrappers and clients for **external services or global app state**.

Examples:

- `auth/` – Auth.js / Supabase session helpers
- `config.ts` – environment configuration
- `database/` – DB abstractions that call Supabase
- `lichess/` – Lichess API validation & helpers

These modules may perform network requests or mutate shared state—import them knowingly and prefer lazy-loading where appropriate.
