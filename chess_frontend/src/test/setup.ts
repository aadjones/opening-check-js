import { expect, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Set up clean environment for each test
beforeEach(() => {
  // Clear localStorage to prevent client conflicts
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  // Clear sessionStorage too
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  // Additional cleanup for Supabase clients
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
});
