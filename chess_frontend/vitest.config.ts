/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    testTimeout: 10000, // 10 second timeout per test
    hookTimeout: 10000, // 10 second timeout for hooks
    // Exclude tests that require external dependencies
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/supabase-integration.test.ts', // Requires Supabase connection
      '**/dbSchema.test.ts', // Requires database connection
      '**/*spacedRepetitionService.test.ts', // Requires Supabase mocking (removed)
    ],
  },
});
