#!/bin/bash
set -e

# NOTE: This script was moved from chess_backend/start.sh to
# chess_backend/scripts/start_dev.sh so that all helper scripts live in one place.
# Paths have been updated accordingly.

# Start FastAPI server
echo "▶︎ starting FastAPI on :${BACKEND_PORT:-8000}…"
uvicorn main:app --reload --port ${BACKEND_PORT:-8000} &
PY_PID=$!

sleep 2

# Start ngrok
echo "▶︎ starting ngrok tunnel…"
ngrok http ${BACKEND_PORT:-8000} --log=stdout --log-format=logfmt > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Cleanup on exit
trap 'echo stopping...; kill $PY_PID $NGROK_PID 2>/dev/null || true' INT TERM

# ───────────────────────────────────────────────
# Fetch the public URL from ngrok's API
# ───────────────────────────────────────────────
echo -n "⏳ waiting for ngrok…"
until curl -s http://localhost:4040/api/tunnels >/dev/null 2>&1; do sleep 1; done

# Prefer jq for JSON parsing, fall back to Python.
if command -v jq >/dev/null 2>&1; then
  URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
else
  URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c 'import sys, json; print(json.load(sys.stdin)["tunnels"][0]["public_url"])')
fi
echo -e "\n🔗  PUBLIC URL → $URL"

# ───────────────────────────────────────────────
# Push to Supabase & redeploy analyze-games
# ───────────────────────────────────────────────
# Set the backend URL secret based on mode
if [ "$mode" = "dev" ]; then
  echo "▶︎ updating BACKEND_URL_DEV secret…"
  supabase secrets set BACKEND_URL_DEV="$URL"
else
  echo "▶︎ updating BACKEND_URL secret…"
    supabase secrets set BACKEND_URL="https://opening-check-js-production-abc5.up.railway.app"
  fi

# The script now lives in chess_backend/scripts, so the project root is two levels up.
PROJECT_ROOT="$(dirname "$0")/../.."
cd "$PROJECT_ROOT"

echo "▶︎ redeploying edge functions…"
for fn in $(ls supabase/functions); do
  if [ -d "supabase/functions/$fn" ] && [[ "$fn" != _shared ]]; then
    supabase functions deploy "$fn" >/dev/null
  fi
done
echo "✅  Edge functions deployed successfully!"
echo "   • sign-jwt: Ready to authenticate users"
echo "   • analyze-games: Ready to process game analysis"
echo "   • BACKEND_URL: $URL"
echo "🚀  Server is ready! Press Ctrl+C to stop"

# ───────────────────────────────────────────────
# Wait until user hits Ctrl-C
# ───────────────────────────────────────────────
wait $PY_PID $NGROK_PID 