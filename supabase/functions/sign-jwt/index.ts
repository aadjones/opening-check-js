/**
 * Sign JWT Edge Function
 * 
 * This function runs on Supabase Edge Functions (serverless) and handles JWT signing.
 * It creates custom JWTs for authenticated database access.
 * 
 * 🏗️ Architecture:
 * Frontend -> Edge Function -> Database (with JWT)
 * 
 * 🔄 Process Flow:
 * 1. Receives user info from frontend
 * 2. Signs a JWT with user claims
 * 3. Returns token for database access
 * 
 * 🔐 Security:
 * - Uses JWT_SECRET from environment
 * - Tokens expire in 1 hour
 * - Includes user role and claims
 * - CORS headers for frontend access
 * 
 * 📝 JWT Claims:
 * - sub: User ID
 * - email: User email (optional)
 * - lichess_username: Lichess username
 * - role: "authenticated"
 * - aud: "authenticated"
 */

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
