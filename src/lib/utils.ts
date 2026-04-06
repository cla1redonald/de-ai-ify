// Utility functions used across the app.
// Pure functions — no side effects, no imports from Next.js.

// ── Word counting ──────────────────────────────────────────────────────────

/**
 * Count words in a string.
 * Split on whitespace, filter empty strings.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── URL validation ─────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid http:// or https:// URL.
 */
export function isValidUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Text cleaning ──────────────────────────────────────────────────────────

/**
 * Strip markdown syntax to produce plain text suitable for scoring.
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`[^`]+`/g, " ")
    // Remove headings (# ## ###)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove bold/italic ***text*** **text** *text* __text__ _text_
    .replace(/(\*{1,3}|_{1,3})(.+?)\1/g, "$2")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, " ")
    // Remove blockquotes
    .replace(/^>\s*/gm, "")
    // Remove HTML tags
    .replace(/<[^>]+>/g, " ")
    // Remove table separators |---|---|
    .replace(/^\|[-:|]+\|[-:||\s]*$/gm, "")
    // Collapse table rows to text
    .replace(/\|/g, " ")
    // Normalise
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalise whitespace: collapse multiple spaces/newlines into single space.
 */
export function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// ── Context extraction ─────────────────────────────────────────────────────

/**
 * Extract surrounding context for a matched phrase.
 * Returns up to `windowWords` words either side of `position`.
 */
export function extractContext(
  text: string,
  position: number,
  matchLength: number,
  windowWords: number = 15
): string {
  // Walk left from position to find start of window
  let start = position;
  let wordsLeft = 0;
  while (start > 0 && wordsLeft < windowWords) {
    start--;
    if (text[start] === " ") wordsLeft++;
  }

  // Walk right from end of match to find end of window
  let end = position + matchLength;
  let wordsRight = 0;
  while (end < text.length && wordsRight < windowWords) {
    end++;
    if (text[end] === " ") wordsRight++;
  }

  // Build context with **bold** around the matched phrase
  const before = text.slice(start, position).trim();
  const match = text.slice(position, position + matchLength);
  const after = text.slice(position + matchLength, end).trim();

  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${before} **${match}**${after ? " " + after : ""}${suffix}`;
}

// ── IP hashing (server-side only) ─────────────────────────────────────────

/**
 * One-way hash an IP address for logging.
 * Returns first 8 hex chars of SHA-256.
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.slice(0, 8);
}
