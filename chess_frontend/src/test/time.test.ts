import { describe, it, expect } from 'vitest';
import { formatTimeControl } from '../utils/time';

describe('formatTimeControl', () => {
  it('converts seconds to minutes and always shows +0', () => {
    expect(formatTimeControl('60')).toBe('1+0');
    expect(formatTimeControl('180')).toBe('3+0');
    expect(formatTimeControl('600')).toBe('10+0');
    expect(formatTimeControl('45')).toBe('45+0');
  });

  it('handles increment correctly', () => {
    expect(formatTimeControl('60+2')).toBe('1+2');
    expect(formatTimeControl('180+2')).toBe('3+2');
    expect(formatTimeControl('600+5')).toBe('10+5');
    expect(formatTimeControl('3+0')).toBe('3+0');
  });

  it('returns input if not a valid time control', () => {
    expect(formatTimeControl('foo')).toBe('foo');
    expect(formatTimeControl('')).toBe('');
    expect(formatTimeControl('1|0')).toBe('1|0');
  });
});
