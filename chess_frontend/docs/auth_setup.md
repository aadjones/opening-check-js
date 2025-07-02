# Auth.js Setup Documentation

## Required Environment Variables

Create a `.env.local` file in the `chess_frontend` directory with the following variables:

```bash
# Auth.js Configuration
VITE_LICHESS_CLIENT_ID=outofbook.dev.local
NEXTAUTH_SECRET=X1ItVLrqu606zXPNCyREbqp26tX07OhQ5PBA78e5kMc=
NEXTAUTH_URL=http://localhost:5173

# Supabase Configuration (Database Only)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

## Setup Steps

### 1. Lichess OAuth Configuration (Updated 2025)

**No registration required!** Lichess now uses a public-client-only model:

- **For Development**: Use any globally unique string as `client_id`

  - Example: `outofbook.dev.local` (already set above)
  - Keep it stable so users don't have to re-consent

- **For Production**: You have two options:
  - **Option A (Simple)**: Use a unique domain-based ID like `outofbook.dev`
  - **Option B (Branded)**: Register via API for custom app name on consent screen:
    ```bash
    curl -X POST https://lichess.org/api/application \
      -H "Authorization: Bearer YOUR_PERSONAL_TOKEN" \
      -d "name=OutOfBook&redirectUris=https://yourapp.com/api/auth/callback/lichess"
    ```

### 2. Generate Auth Secret

Run one of these commands to generate a secure secret:

**Mac/Linux (using OpenSSL):**

```bash
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

**Windows (using PowerShell):**

```powershell
$bytes = New-Object byte[] 32; [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes); [Convert]::ToBase64String($bytes) -replace '\+', '-' -replace '/', '_' -replace '=', ''
```

### 3. Get Supabase Configuration

From your Supabase project dashboard:

- **Project URL**: Settings > API > Project URL
- **Anon Key**: Settings > API > Project API keys > anon public
- **JWT Secret**: Settings > API > JWT Settings > JWT Secret

## Architecture Notes

- **Public Client Model**: No client secrets required (Lichess 2024+ change)
- **PKCE Mandatory**: Uses S256 code challenge method only
- **Custom JWT**: Will sign JWTs for Supabase RLS compatibility
- **Secure Cookies**: Code verifier stored in HTTP-only cookies

## Lichess OAuth Endpoints

- **Authorization**: `https://lichess.org/oauth`
- **Token**: `https://lichess.org/api/token`
- **User Info**: `https://lichess.org/api/account`
- **Scopes**: `preference:read` (for basic profile access)

## Next Steps

1. Set up serverless function for JWT signing
2. Create session sync utility
3. Update existing AuthContext to use Auth.js
