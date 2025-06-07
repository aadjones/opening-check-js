// Utility to parse PGN headers
export function parsePgnHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!pgn) return headers;
  const headerRegex = /^\[(\w+)\s+"([^"]*)"\]/gm;
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2];
  }
  return headers;
}
