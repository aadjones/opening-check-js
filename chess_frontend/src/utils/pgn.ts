// A more robust PGN header parser
export function parsePgnHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {};
  // This regex finds all [Key "Value"] pairs, even with spaces/newlines
  const headerRegex = /\[\s*(\w+)\s*"([^"]+)"\s*\]/g;
  let match;

  // We only need to search the first part of the PGN string for headers
  const pgnHeaderBlock = pgn.substring(0, Math.min(pgn.length, 1000));

  while ((match = headerRegex.exec(pgnHeaderBlock)) !== null) {
    // match[1] is the Key (e.g., "Opening")
    // match[2] is the Value (e.g., "Alekhine Defense: Scandinavian Variation")
    headers[match[1]] = match[2];
  }

  return headers;
}
