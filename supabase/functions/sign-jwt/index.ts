// functions/sign-jwt/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { SignJWT } from "https://deno.land/x/jose@v4.14.4/index.ts";
Deno.serve(async (req)=>{
  // Handle pre‑flight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { sub, email, lichess_username } = await req.json();
    // Make sure the secret exists
    const secret = Deno.env.get("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET not set");
    const key = new TextEncoder().encode(secret);
    const iat = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      sub,
      email,
      role: "authenticated",
      lichess_username,
      aud: "authenticated"
    }).setProtectedHeader({
      alg: "HS256"
    }).setIssuedAt(iat).setExpirationTime("1h").sign(key);
    return new Response(JSON.stringify({
      token: jwt
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
