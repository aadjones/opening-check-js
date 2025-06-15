#!/bin/bash
set -e

# Start FastAPI server
echo "▶︎ starting FastAPI on :${BACKEND_PORT:-8000}…"
uvicorn main:app --reload --port ${BACKEND_PORT:-8000} &
PY_PID=$!

sleep 2

# Start ngrok
echo "▶︎ starting ngrok tunnel…"
ngrok http ${BACKEND_PORT:-8000} --log=stdout --log-format=logfmt > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Set up trap for cleanup
trap 'echo stopping...; kill $PY_PID $NGROK_PID 2>/dev/null || true' INT TERM

# ───────────────────────────────────────────────
# Fetch the public URL from ngrok's API
# ───────────────────────────────────────────────
echo -n "⏳ waiting for ngrok…"
until curl -s http://localhost:4040/api/tunnels >/dev/null 2>&1; do sleep 1; done
URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
echo -e "\n🔗  PUBLIC URL → $URL"

# ───────────────────────────────────────────────
# Push to Supabase & redeploy analyze‑games
# ───────────────────────────────────────────────
echo "▶︎ updating BACKEND_URL secret…"
supabase secrets set BACKEND_URL="$URL" >/dev/null
echo "▶︎ redeploying edge functions…"
cd "$(dirname "$0")/.."
for fn in $(ls supabase/functions); do
  if [ -d "supabase/functions/$fn" ] && [[ "$fn" != _shared ]]; then
    supabase functions deploy --project-ref "${PROJECT_REF}" "$fn" >/dev/null
  fi
done
echo "✅  Edge functions deployed successfully!"
echo "   • sign-jwt: Ready to authenticate users"
echo "   • analyze-games: Ready to process game analysis"
echo "   • BACKEND_URL: $URL"
echo "🚀  Server is ready! Press Ctrl+C to stop"

# ───────────────────────────────────────────────
# Wait until user hits Ctrl‑C
# ───────────────────────────────────────────────
wait $PY_PID $NGROK_PID 