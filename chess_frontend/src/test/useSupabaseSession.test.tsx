// src/test/useSupabaseSession.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Session, User } from '@supabase/supabase-js';

/* ── hoisted mocks ────────────────────────────────────────────────────── */
vi.mock('../lib/supabase', () => {
  const getSession = vi.fn();
  const setSession = vi.fn();
  const onAuthStateChange = vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  }));

  return {
    supabase: { auth: { getSession, setSession, onAuthStateChange } },
  };
});
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

/* ── real imports AFTER mocks ─────────────────────────────────────────── */
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useSupabaseSession } from '../hooks/useSupabaseSession';

/* ── helpers ──────────────────────────────────────────────────────────── */
const mockUser: User = {
  id: 'user‑123',
  email: 'x@x.x',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2025‑01‑01T00:00:00Z',
};
const mkSession = (token: string): Session => ({
  access_token: token,
  refresh_token: '',
  provider_token: null,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
});
const getSessionMock = supabase.auth.getSession as Mock;
const setSessionMock = supabase.auth.setSession as Mock;
const onAuthMock = supabase.auth.onAuthStateChange as Mock;

/* ── tests ────────────────────────────────────────────────────────────── */
describe('useSupabaseSession', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.resetAllMocks());

  it('returns existing Supabase session unchanged when IDs match', async () => {
    (useAuth as Mock).mockReturnValue({
      session: { user: mockUser, accessToken: 'token‑A' },
    });
    getSessionMock.mockResolvedValue({ data: { session: mkSession('token‑A') }, error: null });

    const { result } = renderHook(() => useSupabaseSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(setSessionMock).not.toHaveBeenCalled();
    expect(result.current.session?.access_token).toBe('token‑A');
  });

  /* ------------ FIXED: Supabase session is null, so setSession() must run */
  it('calls setSession() when Supabase session is missing', async () => {
    (useAuth as Mock).mockReturnValue({
      session: { user: mockUser, accessToken: 'token‑NEW' },
    });
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    setSessionMock.mockResolvedValue({ data: { session: mkSession('token‑NEW') }, error: null });

    const { result } = renderHook(() => useSupabaseSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(setSessionMock).toHaveBeenCalledWith({
      access_token: 'token‑NEW',
      refresh_token: '',
    });
    expect(result.current.session?.access_token).toBe('token‑NEW');
  });

  /* ------------ FIXED: surface setSession error (session initially null) */
  it('surfaces errors from setSession()', async () => {
    (useAuth as Mock).mockReturnValue({
      session: { user: mockUser, accessToken: 'token‑X' },
    });
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    setSessionMock.mockResolvedValue({
      data: { session: null },
      error: new Error('setSession failed'),
    });

    const { result } = renderHook(() => useSupabaseSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('setSession failed');
    expect(result.current.session).toBeNull();
  });

  it('surfaces errors from getSession()', async () => {
    (useAuth as Mock).mockReturnValue({
      session: { user: mockUser, accessToken: 'token‑Y' },
    });
    getSessionMock.mockRejectedValue(new Error('getSession failed'));

    const { result } = renderHook(() => useSupabaseSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('getSession failed');
  });

  it('updates state when Supabase fires onAuthStateChange()', async () => {
    (useAuth as Mock).mockReturnValue({
      session: { user: mockUser, accessToken: 'token‑A' },
    });
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    setSessionMock.mockResolvedValue({ data: { session: mkSession('token‑A') }, error: null });

    const { result } = renderHook(() => useSupabaseSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const cb = onAuthMock.mock.calls[0][0];
    await act(async () => cb('TOKEN_REFRESHED', mkSession('token‑B')));

    expect(result.current.session?.access_token).toBe('token‑B');
  });
});
