/**
 * Analyze Games Edge Function
 * 
 * This function runs on Supabase Edge Functions (serverless) and coordinates game analysis.
 * It acts as a bridge between the frontend and backend analysis service.
 * 
 * 🏗️ Architecture:
 * Frontend -> Edge Function -> Backend API -> Lichess API
 *                              -> Database
 * 
 * 🔄 Process Flow:
 * 1. Receives JWT-authenticated request from frontend
 * 2. Fetches user's active studies from database
 * 3. Calls backend API to analyze games
 * 4. Stores deviations in database
 * 5. Updates user's last analyzed timestamp
 * 
 * 🔐 Security:
 * - JWT verification required
 * - Uses service role key for database access
 * - CORS headers for frontend access
 * 
 * 📝 Database Operations:
 * - Reads user profiles and studies
 * - Writes deviations and analysis timestamps
 */

// functions/analyze-games/index.ts
//---------------------------------------------------------------
//  Supabase Edge Function - Analyze Games
//---------------------------------------------------------------
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify }   from "https://deno.land/x/jose@v4.14.4/index.ts";
import { corsHeaders } from "../_shared/cors.ts";

// ── types ─────────────────────────────────────────────────────
interface Deviation {
  study_id?: string | null;
  game_id?: string | null;
  board_fen_before_deviation?: string;
  reference_san?: string;
  deviation_san?: string;
  whole_move_number?: number;
  player_color?: string | null;
  pgn?: string | null;
  deviation_uci?: string | null;
  reference_uci?: string | null;
}

interface DeviationRow {
  user_id: string;
  study_id: string | null;
  game_id: string | null;
  position_fen: string;
  expected_move: string;
  actual_move: string;
  move_number: number;
  color: string | null;
  detected_at: string;
  pgn: string | null;
  deviation_uci?: string | null;
  reference_uci?: string | null;
}

interface SyncPreferences {
  sync_frequency_minutes: number;
  is_auto_sync_enabled: boolean;
}

interface AnalyzeRequest {
  scope: 'recent' | 'today';
}

// ── env ────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BACKEND_URL = Deno.env.get("BACKEND_URL") ?? "";

// ── db client (service role) ───────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── util ───────────────────────────────────────────────────────
const normaliseColor = (c?: string | null) =>
  c?.toLowerCase().startsWith("w") ? "white" :
  c?.toLowerCase().startsWith("b") ? "black" :
  null;

// ── main worker ────────────────────────────────────────────────
async function analyseUserGames(userId: string, scope: 'recent' | 'today') {
  // 1) Get user profile and sync preferences
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("lichess_username, last_synced_at")
    .eq("id", userId)
    .single();
  if (pErr || !profile) throw pErr ?? new Error("profile missing");

  const { data: syncPrefs, error: spErr } = await supabase
    .from("sync_preferences")
    .select("sync_frequency_minutes, is_auto_sync_enabled")
    .eq("user_id", userId)
    .single();
  if (spErr) throw spErr;

  // If auto-sync is disabled, only sync if last_synced_at is null (first sync)
  if (!syncPrefs?.is_auto_sync_enabled && profile.last_synced_at) {
    console.log("Auto-sync disabled, skipping analysis");
    return;
  }

  // 2) Get studies
  const { data: studies, error: sErr } = await supabase
    .from("lichess_studies")
    .select("study_url, study_name")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (sErr) throw sErr;

  const whiteStudy = studies.find(s => /white/i.test(s.study_name))?.study_url;
  const blackStudy = studies.find(s => /black/i.test(s.study_name))?.study_url;

  // 3) Calculate since timestamp based on scope
  let since: string | undefined;
  if (scope === 'today') {
    // Set to start of today in UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    since = startOfDay.toISOString();
  }

  // 4) Call engine with appropriate parameters
  const engineResp = await fetch(`${BACKEND_URL}/api/analyze_games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: profile.lichess_username,
      study_url_white: whiteStudy,
      study_url_black: blackStudy,
      max_games: scope === 'recent' ? 10 : undefined, // Only limit for recent games
      since: since, // Only set for today's games
    }),
  });
  if (!engineResp.ok) {
    const txt = await engineResp.text().catch(() => "");
    throw new Error(`Backend API ${engineResp.status} – ${txt}`);
  }
  const result = await engineResp.json();
  if (!Array.isArray(result)) {
    console.log(result.message || "No deviations found.");
    // Update last_synced_at even if no games found
    await updateLastSyncedAt(userId);
    return;
  }
  const deviations = result;
  const rows = deviations.filter(Boolean).map(d => ({
    user_id:       userId,
    study_id:      d?.study_id ?? null,
    game_id:       d?.game_id  ?? null,
    position_fen:  d?.board_fen ?? '',
    expected_move: d?.reference_san ?? '',
    actual_move:   d?.deviation_san ?? '',
    move_number:   d?.whole_move_number ?? 0,
    color:         normaliseColor(d?.player_color),
    detected_at:   new Date().toISOString(),
    pgn:           d?.pgn ?? null,
    deviation_uci: d?.deviation_uci ?? null,
    reference_uci: d?.reference_uci ?? null,
  })) as DeviationRow[];

  if (rows.length) {
    const { error: upsertErr } = await supabase
      .from("opening_deviations")
      .upsert(rows, { onConflict: "user_id,game_id,move_number,color" });
    if (upsertErr) throw upsertErr;
  }

  // 4) Update last_synced_at
  await updateLastSyncedAt(userId);
}

async function updateLastSyncedAt(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

// ── request handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!raw) throw new Error("No authorization header");

    // Verify JWT and get user ID
    const { payload } = await jwtVerify(raw, new TextEncoder().encode(Deno.env.get("JWT_SECRET")));
    const userId = payload.sub as string;
    if (!userId) throw new Error("Invalid JWT payload");

    // Get request body
    const { scope = 'recent' } = await req.json() as AnalyzeRequest;
    if (scope !== 'recent' && scope !== 'today') {
      throw new Error("Invalid scope. Must be 'recent' or 'today'");
    }

    // Run analysis
    await analyseUserGames(userId, scope);

    return new Response(
      JSON.stringify({ 
        message: `Successfully analyzed ${scope === 'recent' ? 'last 10' : "today's"} games`,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    );

  } catch (error: unknown) {
    console.error('Game analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    );
  }
});
