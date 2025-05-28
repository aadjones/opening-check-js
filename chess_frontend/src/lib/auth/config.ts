import type { AuthConfig } from '@auth/core';
import type { LichessProfile } from './types';

// Import the type extensions
import './types';

// Custom Lichess OAuth provider configuration
const LichessProvider = {
  id: 'lichess',
  name: 'Lichess',
  type: 'oauth' as const,
  authorization: {
    url: 'https://lichess.org/oauth',
    params: {
      scope: 'preference:read',
      response_type: 'code',
      code_challenge_method: 'S256',
    },
  },
  token: 'https://lichess.org/api/token',
  userinfo: 'https://lichess.org/api/account',
  clientId: import.meta.env.VITE_LICHESS_CLIENT_ID,
  profile(profile: LichessProfile) {
    return {
      id: profile.id,
      name: profile.username,
      email: profile.email || `${profile.username}@lichess.org`, // Lichess doesn't always provide email
      image: `https://lichess1.org/assets/_${profile.id}/logo/64.png`,
      lichessUsername: profile.username,
    };
  },
};

export const authConfig: AuthConfig = {
  providers: [LichessProvider],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.lichessUsername = user?.lichessUsername;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.lichessUsername = token.lichessUsername as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // Redirect to landing page for sign in
  },
};
