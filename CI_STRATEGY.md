# CI Setup for Chess Opening Deviation Analyzer

## What This Does

Every time you push code or make a PR, GitHub automatically:
- ✅ Runs your tests (backend + frontend)
- ✅ Checks code formatting (Black, Prettier)
- ✅ Lints your code (Flake8, ESLint)
- ✅ Scans for security issues
- ✅ Makes sure everything builds

## Files Added

- `.github/workflows/ci.yml` - The main CI pipeline
- `.github/dependabot.yml` - Auto-updates dependencies weekly

## What Dependabot Does

Creates PRs like "Bump react from 19.1.0 to 19.2.0" when new versions come out. You can review and merge them. Keeps your dependencies secure and up-to-date.

## Local Development

Before pushing, run these to catch issues early:

**Backend:**
```bash
cd chess_backend
make check-all  # Runs all quality checks
```

**Frontend:**
```bash
cd chess_frontend
npm run format && npm run lint && npm run test:run
```

## That's It

The CI will catch issues automatically. Green checkmarks = good to merge. Red X's = fix the issues first.

No setup required - it just works once you push to GitHub. 