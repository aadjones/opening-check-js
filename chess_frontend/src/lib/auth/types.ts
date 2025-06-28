// Lichess profile type
export interface LichessProfile {
  id: string;
  username: string;
  email?: string;
  title?: string;
  patron?: boolean;
  verified?: boolean;
}

// Extend the built-in session types
declare module '@auth/core/types' {
  interface Session {
    accessToken?: string;
    user: {
      lichessUsername?: string;
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    lichessUsername?: string;
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface JWT {
    accessToken?: string;
    lichessUsername?: string;
  }
}
