import { generatePKCE, storeCodeVerifier } from './pkce';

/**
 * Lichess OAuth Flow
 *
 * This module runs in the browser and handles the OAuth flow with Lichess:
 * 1. Initiates OAuth by redirecting to Lichess
 * 2. Handles the callback from Lichess
 * 3. Exchanges the auth code for an access token
 * 4. Fetches the user's Lichess profile
 *
 * 🔄 Flow:
 * Browser -> Lichess -> Browser (callback) -> Backend -> Browser
 *
 * 🔐 Security: Uses PKCE (Proof Key for Code Exchange) to prevent code interception attacks.
 * The code verifier is stored in sessionStorage and cleared after use.
 */

/**
 * Lichess OAuth configuration
 */
const LICHESS_CONFIG = {
  authorizationEndpoint: 'https://lichess.org/oauth',
  tokenEndpoint: 'https://lichess.org/api/token',
  userInfoEndpoint: 'https://lichess.org/api/account',
  clientId: import.meta.env.VITE_LICHESS_CLIENT_ID || 'outofbook.dev.local',
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: 'preference:read',
};

/**
 * Lichess user profile interface
 */
export interface LichessUser {
  id: string;
  username: string;
  email?: string;
  title?: string;
  patron?: boolean;
  verified?: boolean;
  profile?: {
    country?: string;
    location?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
  };
  perfs?: Record<
    string,
    {
      games: number;
      rating: number;
      rd: number;
      prog: number;
      prov?: boolean;
    }
  >;
  createdAt?: number;
  seenAt?: number;
  playTime?: {
    total: number;
    tv: number;
  };
  url?: string;
  count?: {
    all: number;
    rated: number;
    ai: number;
    draw: number;
    drawH: number;
    loss: number;
    lossH: number;
    win: number;
    winH: number;
    bookmark: number;
    playing: number;
    import: number;
    me: number;
  };
}

/**
 * Token exchange response interface
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

/**
 * Generates a random state parameter for OAuth security
 */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Builds the Lichess OAuth authorization URL with PKCE
 */
export async function buildLichessOAuthURL(): Promise<string> {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateState();

  // Store the code verifier and state for later verification
  storeCodeVerifier(codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LICHESS_CONFIG.clientId,
    redirect_uri: LICHESS_CONFIG.redirectUri,
    scope: LICHESS_CONFIG.scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
  });

  const authUrl = `${LICHESS_CONFIG.authorizationEndpoint}?${params.toString()}`;

  console.log('Generated Lichess OAuth URL:', authUrl);
  console.log('Redirect URI:', LICHESS_CONFIG.redirectUri);
  console.log('Client ID:', LICHESS_CONFIG.clientId);

  return authUrl;
}

/**
 * Initiates the Lichess OAuth flow by redirecting to Lichess
 */
export async function startLichessOAuth(): Promise<void> {
  try {
    const authUrl = await buildLichessOAuthURL();
    console.log('Redirecting to Lichess OAuth...');
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to start Lichess OAuth:', error);
    throw error;
  }
}

/**
 * Validates OAuth callback parameters
 */
export function validateOAuthCallback(searchParams: URLSearchParams): {
  code: string;
  state: string;
} {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    throw new Error(`OAuth error: ${error}`);
  }

  if (!code) {
    throw new Error('No authorization code received');
  }

  if (!state) {
    throw new Error('No state parameter received');
  }

  const storedState = sessionStorage.getItem('oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  return { code, state };
}

/**
 * Exchanges authorization code for access token
 */
export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: LICHESS_CONFIG.clientId,
    code: code,
    redirect_uri: LICHESS_CONFIG.redirectUri,
    code_verifier: codeVerifier,
  });

  console.log('Exchanging code for token with Lichess...');

  const response = await fetch(LICHESS_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed:', response.status, errorText);
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const tokenData = await response.json();
  console.log('Token exchange successful');

  return tokenData;
}

/**
 * Fetches user profile from Lichess using access token
 */
export async function fetchLichessUser(accessToken: string): Promise<LichessUser> {
  console.log('Fetching Lichess user profile...');

  const response = await fetch(LICHESS_CONFIG.userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('User info fetch failed:', response.status, errorText);
    throw new Error(`Failed to fetch user info: ${response.status} ${errorText}`);
  }

  const userData = await response.json();
  console.log('User profile fetched successfully:', userData.username);

  return userData;
}

/**
 * Complete OAuth flow: exchange code for token and fetch user info
 */
export async function completeOAuthFlow(
  code: string,
  codeVerifier: string
): Promise<{ user: LichessUser; accessToken: string }> {
  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code, codeVerifier);

    // Fetch user profile
    const user = await fetchLichessUser(tokenResponse.access_token);

    return {
      user,
      accessToken: tokenResponse.access_token,
    };
  } catch (error) {
    console.error('OAuth flow completion failed:', error);
    throw error;
  }
}

export { LICHESS_CONFIG };
