// Utility for formatting chess time controls
export function formatTimeControl(tc: string): string {
  const match = tc.match(/^(\d+)(\+(\d+))?$/);
  if (match) {
    const base = parseInt(match[1], 10);
    const increment = match[3] ? parseInt(match[3], 10) : 0;
    if (base >= 60 && base % 60 === 0) {
      return `${base / 60}+${increment}`;
    }
    return `${base}+${increment}`;
  }
  return tc;
}
