// functions/analyze-games/index.ts
//---------------------------------------------------------------
//  Supabase Edge Function – Analyze Games
//---------------------------------------------------------------
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify }   from "https://deno.land/x/jose@v4.14.4/index.ts";
import { corsHeaders } from "../_shared/cors.ts";

// ── env ────────────────────────────────────────────────────────
const BACKEND_URL               = Deno.env.get("BACKEND_URL")!;         // set by Makefile
const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY          = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_JWT_SECRET       = Deno.env.get("JWT_SECRET")!;

// ── db client (service role) ───────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── util ───────────────────────────────────────────────────────
const normaliseColor = (c?: string | null) =>
  c?.toLowerCase().startsWith("w") ? "white" :
  c?.toLowerCase().startsWith("b") ? "black" :
  null;

// ── main worker ────────────────────────────────────────────────
async function analyseUserGames(userId: string) {
  // 1) username
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("lichess_username")
    .eq("id", userId)
    .single();
  if (pErr || !profile) throw pErr ?? new Error("profile missing");

  // 2) studies
  const { data: studies, error: sErr } = await supabase
    .from("lichess_studies")
    .select("study_url, study_name")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (sErr) throw sErr;

  const whiteStudy = studies.find(s => /white/i.test(s.study_name))?.study_url;
  const blackStudy = studies.find(s => /black/i.test(s.study_name))?.study_url;

  // 3) call engine
  const engineResp = await fetch(`${BACKEND_URL}/api/analyze_games`, {   // adjust path if needed
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username:        profile.lichess_username,
      study_url_white: whiteStudy,
      study_url_black: blackStudy,
      max_games:       10,
    }),
  });
  if (!engineResp.ok) {
    const txt = await engineResp.text().catch(() => "");
    throw new Error(`Backend API ${engineResp.status} – ${txt}`);
  }
  const deviations = await engineResp.json() as any[];

  // 4) upsert deviations
  const rows = deviations.filter(Boolean).map(d => ({
    user_id:       userId,
    study_id:      d?.study_id ?? null,
    game_id:       d?.game_id  ?? null,
    position_fen:  d?.board_fen_before_deviation,
    expected_move: d?.reference_san,
    actual_move:   d?.deviation_san,
    move_number:   d?.whole_move_number,
    color:         normaliseColor(d?.player_color),
    detected_at:   new Date().toISOString(),
  }));

  if (rows.length) {
    const { error: upsertErr } = await supabase
      .from("opening_deviations")
      .upsert(rows, { onConflict: "user_id,game_id,move_number,color" });
    if (upsertErr) throw upsertErr;
  }

  // 5) update last analysed timestamp
  await supabase
    .from("profiles")
    .update({ last_analyzed_at: new Date().toISOString() })
    .eq("id", userId);
}

// ── request handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!raw) throw new Error("No authorization header");

    // local JWT verification
    const { payload } = await jwtVerify(
      raw,
      new TextEncoder().encode(SUPABASE_JWT_SECRET),
      { algorithms: ["HS256"], audience: "authenticated" },
    );

    const userId = payload.sub as string | undefined;
    if (!userId) throw new Error("JWT missing sub claim");

    await analyseUserGames(userId);

    return new Response(
      JSON.stringify({ message: "Analysis completed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("analyze-games:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
