// Shared TypeScript types for de-ai-ify.
// Used by the scoring engine (client-side) and API routes (server-side).
//
// TODO(@engineer): These types are complete — implement against them.
// Do not change the shape without updating all callers.

// ── Scoring engine output ──────────────────────────────────────────────────

export interface PatternMatch {
  pattern: string;   // the pattern/phrase that matched
  text: string;      // the actual text that was matched (may differ from pattern for regex)
  position: number;  // character offset in the original text
}

export interface CategoryResult {
  category: string;        // display name, e.g. "AI Clichés"
  weight: number;          // 0–100, contribution to final score
  matches: PatternMatch[];
  density: number;         // 0–1 normalised density score for this category
  severity: "low" | "medium" | "high";  // derived from density
}

export interface SlopScore {
  score: number;                  // 0–100 final weighted score
  grade: "human" | "mixed" | "slop";
  verdictCopy: string;            // editorial sentence(s) describing the result
  categories: CategoryResult[];
  wordCount: number;
  note?: string;                  // e.g. "Text too short to score reliably"
}

// ── UI-layer types (consumed by React components) ─────────────────────────

export interface HighlightSpan {
  start: number;     // character offset in original text
  end: number;       // character offset in original text
  category: string;  // category display name, used for tooltip
}

export interface PatternResult {
  category: string;
  count: number;
  severity: "low" | "medium" | "high";
  instances: string[];   // flagged phrases with ~15 words of surrounding context
}

export interface ScoreResult {
  score: number;
  grade: "human" | "mixed" | "slop";
  verdictCopy: string;
  patterns: PatternResult[];
  originalText: string;
  highlights: HighlightSpan[];
  wordCount: number;
}

// ── Score tiers ────────────────────────────────────────────────────────────

export const SCORE_TIERS = {
  human: { min: 0,  max: 30,  label: "HUMAN", color: "score-green" },
  mixed: { min: 31, max: 69,  label: "MIXED",  color: "score-amber" },
  slop:  { min: 70, max: 100, label: "SLOP",   color: "score-red"   },
} as const;

export function getGrade(score: number): ScoreResult["grade"] {
  if (score <= 30) return "human";
  if (score <= 69) return "mixed";
  return "slop";
}

// ── API request/response shapes ────────────────────────────────────────────

export interface ScrapeRequest  { url: string }
export interface ScrapeResponse { text: string; title: string; wordCount: number }
export interface ScrapeError    { error: "INVALID_URL" | "SCRAPE_FAILED"; message: string }

export interface RewriteRequest  { text: string }
export interface RewriteResponse { rewritten: string; model: string }
export interface RewriteError    {
  error: "INVALID_INPUT" | "RATE_LIMITED" | "REWRITE_FAILED";
  message?: string;
  remaining?: number;
  resetsAt?: string;
}
