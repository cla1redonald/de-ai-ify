// TODO(@engineer): Utility functions used across the app.
// These are pure functions — no side effects, no imports from Next.js.

// ── Word counting ──────────────────────────────────────────────────────────

/**
 * Count words in a string.
 * Split on whitespace, filter empty strings.
 * Used by scoring engine and API route input validation.
 * TODO: implement
 */
export function countWords(_text: string): number {
  return 0; // TODO: text.trim().split(/\s+/).filter(Boolean).length
}

// ── URL validation ─────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid http:// or https:// URL.
 * Used by client-side validation before calling /api/scrape.
 * TODO: implement using URL constructor — wrap in try/catch.
 */
export function isValidUrl(_input: string): boolean {
  return false; // TODO: try { const u = new URL(input); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
}

// ── Text cleaning ──────────────────────────────────────────────────────────

/**
 * Strip markdown syntax (headings, bold, italic, links, code fences, etc.)
 * to produce plain text suitable for scoring.
 * Used by /api/scrape after Firecrawl returns markdown.
 * TODO: implement with regex replacements.
 */
export function stripMarkdown(_markdown: string): string {
  return _markdown; // TODO: implement
}

/**
 * Normalise whitespace: collapse multiple spaces/newlines into single space.
 * Used before word counting and pattern matching.
 * TODO: implement
 */
export function normaliseWhitespace(_text: string): string {
  return _text; // TODO: text.replace(/\s+/g, ' ').trim()
}

// ── Context extraction ─────────────────────────────────────────────────────

/**
 * Extract surrounding context for a matched phrase.
 * Returns up to `windowWords` words either side of `position`.
 * Used by scoring engine to build PatternMatch.text with context.
 * TODO: implement
 */
export function extractContext(
  _text: string,
  _position: number,
  _windowWords: number = 15
): string {
  return ""; // TODO: implement
}

// ── IP hashing (server-side only) ─────────────────────────────────────────

/**
 * One-way hash an IP address for logging.
 * Use crypto.subtle.digest('SHA-256', ...) — available in Edge and Node runtimes.
 * Returns first 8 hex chars of SHA-256 — enough to correlate logs, not enough to reverse.
 * TODO: implement
 */
export async function hashIp(_ip: string): Promise<string> {
  return "00000000"; // TODO: implement with SubtleCrypto
}
