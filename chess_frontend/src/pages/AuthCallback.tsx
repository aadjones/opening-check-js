import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateOAuthCallback, completeOAuthFlow } from '../lib/auth/lichessOAuth';
import { getStoredCodeVerifier, clearCodeVerifier } from '../lib/auth/pkce';
import { fetchSupabaseJWT } from '../lib/auth/fetchSupabaseJWT';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React StrictMode
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);

        console.log('OAuth callback received with params:', Object.fromEntries(urlParams));

        // Validate the callback parameters
        const { code, state } = validateOAuthCallback(urlParams);

        console.log('OAuth validation successful:', { code: code.substring(0, 10) + '...', state });

        // Get the stored code verifier
        const codeVerifier = getStoredCodeVerifier();
        if (!codeVerifier) {
          throw new Error('No code verifier found - possible session timeout');
        }

        console.log('Code verifier found, starting token exchange...');

        // Exchange authorization code for access token and fetch user info
        const { user, accessToken } = await completeOAuthFlow(code, codeVerifier);

        // Resolve the UUID for this user (creating a profile if needed)
        const supabaseJwt = await fetchSupabaseJWT({
          sub: user.id,
          email: user.email || undefined,
          lichess_username: user.username || undefined,
        });
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseWithAuth = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseJwt}`,
            },
          },
        });
        const { getOrCreateUserProfile } = await import('../lib/database/studyOperations');
        const uuid = await getOrCreateUserProfile(user.username, supabaseWithAuth);
        const userWithUUID = { ...user, id: uuid };

        // Store the user data with UUID in sessionStorage
        sessionStorage.setItem('lichess_user', JSON.stringify(userWithUUID));
        sessionStorage.setItem('lichess_access_token', accessToken);

        // Notify AuthJSContext that a new session is available
        window.dispatchEvent(new CustomEvent('auth-session-refresh'));

        // Check if this is a first-time user
        const { data: profile, error: profileError } = await supabaseWithAuth
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', uuid)
          .single();
        if (profileError) {
          console.error('Error fetching onboarding status:', profileError);
        }
        const isFirstTime = !profile?.onboarding_completed;

        setStatus('success');
        if (isFirstTime) {
          setMessage(`Welcome ${user.username}! Let's set up your repertoire...`);
        } else {
          setMessage(`Welcome back ${user.username}! Redirecting to dashboard...`);
        }

        // Clean up OAuth-specific stored values
        clearCodeVerifier();
        sessionStorage.removeItem('oauth_state');

        // Redirect based on user status
        setTimeout(() => {
          if (isFirstTime) {
            console.log('First-time user detected, redirecting to onboarding...');
            navigate('/onboarding');
          } else {
            console.log('Returning user detected, redirecting to dashboard...');
            navigate('/dashboard');
          }
        }, 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');

        // Clean up stored values even on error
        clearCodeVerifier();
        sessionStorage.removeItem('oauth_state');

        // Redirect to landing page after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '400px' }}>
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Processing Authentication</h2>
            <p>Please wait while we complete your Lichess login...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
            <h2>Authentication Successful!</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h2>Authentication Failed</h2>
            <p>{message}</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
