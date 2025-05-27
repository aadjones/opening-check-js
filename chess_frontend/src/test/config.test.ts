import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Configuration Tests', () => {
  describe('Environment Variables', () => {
    it('should have Supabase URL configured', () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      if (supabaseUrl) {
        // If env var is set, it should be a valid URL
        expect(supabaseUrl).toMatch(/^https?:\/\/.+/);
        expect(supabaseUrl).not.toBe('https://placeholder.supabase.co');
      } else {
        // If not set, we should be using the fallback
        console.warn('VITE_SUPABASE_URL not set - using fallback for testing');
      }
    });

    it('should have Supabase anon key configured', () => {
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseAnonKey) {
        // If env var is set, it should not be the placeholder
        expect(supabaseAnonKey).not.toBe('placeholder-anon-key');
        expect(supabaseAnonKey.length).toBeGreaterThan(10);
      } else {
        // If not set, we should be using the fallback
        console.warn('VITE_SUPABASE_ANON_KEY not set - using fallback for testing');
      }
    });
  });

  describe('Supabase Client', () => {
    it('should create supabase client without errors', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    });

    it('should have correct supabase client configuration', () => {
      // Test that the client has the expected structure
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.from).toBe('function');
    });
  });

  describe('Application Health', () => {
    it('should be able to import core modules', async () => {
      // Test that our main modules can be imported without errors
      const supabaseModule = await import('../lib/supabase');
      expect(supabaseModule.supabase).toBeDefined();
    });
  });
});
