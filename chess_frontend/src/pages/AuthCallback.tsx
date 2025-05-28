import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateOAuthCallback } from '../lib/auth/lichessOAuth';
import { getStoredCodeVerifier, clearCodeVerifier } from '../lib/auth/pkce';

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
        
        console.log('Code verifier found, ready for token exchange');
        
        // TODO: Exchange authorization code for access token
        // This would normally be done by calling our serverless function
        // For now, we'll simulate success
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Clean up stored values
        clearCodeVerifier();
        sessionStorage.removeItem('oauth_state');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
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
            <p>Welcome! Redirecting you to the dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h2>Authentication Failed</h2>
            <p>{message}</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
              Redirecting to home page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 