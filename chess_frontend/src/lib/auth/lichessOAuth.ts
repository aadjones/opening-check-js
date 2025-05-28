import { generatePKCE, storeCodeVerifier } from './pkce';

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

export { LICHESS_CONFIG }; 