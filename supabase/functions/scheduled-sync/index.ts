import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT } from "https://deno.land/x/jose@v4.14.4/index.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function _generateUserJWT({ sub, email, lichess_username }: { sub: string, email?: string, lichess_username?: string }) {
  const key = new TextEncoder().encode(JWT_SECRET);
  const iat = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    sub,
    email,
    role: "authenticated",
    lichess_username,
    aud: "authenticated"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime("1h")
    .sign(key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // No custom secret check → rely on Supabase's default JWT verification.
  // If the runtime accepted the JWT, we're authorised.

  const now = new Date();
  const syncedUsers: string[] = [];
  const errors: { user_id: string, error: string }[] = [];

  try {
    // 1. Get all users with auto sync enabled
    const { data: users, error } = await supabase
      .from("sync_preferences")
      .select("user_id, sync_frequency_minutes, updated_at")
      .eq("is_auto_sync_enabled", true);
    if (error) throw error;
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No users with auto sync enabled." }), { headers: corsHeaders });
    }

    for (const user of users) {
      try {
        const lastSync = user.updated_at ? new Date(user.updated_at) : null;
        const freqMs = user.sync_frequency_minutes * 60 * 1000;
        if (!lastSync || now.getTime() - lastSync.getTime() >= freqMs) {
          // Get user profile for JWT
          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("email, lichess_username")
            .eq("id", user.user_id)
            .single();
          if (profileErr || !profile) throw profileErr ?? new Error("Profile not found");

          // Generate JWT for this user
          // const jwt = await generateUserJWT({
          //   sub: user.user_id,
          //   email: profile.email,
          //   lichess_username: profile.lichess_username
          // });

          // Call Python backend analyze_games endpoint
          const res = await fetch(`http://host.docker.internal:8000/api/analyze_games`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              max_games: 10
            })
          });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`analyze-games failed: ${errText}`);
          }

          // Update updated_at in sync_preferences
          await supabase
            .from("sync_preferences")
            .update({ updated_at: now.toISOString() })
            .eq("user_id", user.user_id);

          syncedUsers.push(user.user_id);
        }
      } catch (err: unknown) {
        let errorMsg = "Unknown error";
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (typeof err === "string") {
          errorMsg = err;
        }
        errors.push({ user_id: user.user_id, error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sync complete. ${syncedUsers.length} user(s) synced.`,
        syncedUsers,
        errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    let errorMsg = "Unknown error";
    if (err instanceof Error) {
      errorMsg = err.message;
    } else if (typeof err === "string") {
      errorMsg = err;
    }
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 