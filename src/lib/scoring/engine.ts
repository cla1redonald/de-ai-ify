// TODO(@engineer): Implement the client-side scoring engine.
//
// This is the core of the product. Pure TypeScript — no network calls.
// Importable by client components and server code alike.
//
// Public API:
//   calculateScore(text: string): SlopScore
//
// Algorithm (from docs/architecture.md §"Scoring Algorithm"):
//
//   1. Count words. If < 20, return { score: 0, note: "Text too short to score" }
//
//   2. Run each category analyser:
//        analyseCategory(text, wordCount, category: PatternCategory): CategoryResult
//
//   3. Weighted sum of density scores:
//        raw = sum(category.density * category.weight)
//        score = Math.min(100, Math.round(raw))
//
//   4. Derive grade and verdictCopy from score.
//
//   5. Collect all PatternMatch objects across categories into HighlightSpan[].
//
// Density curve (sigmoid — prevents short texts being penalised unfairly):
//   function densityCurve(matchesPerHundredWords, expected):
//     if matchesPerHundredWords === 0: return 0
//     ratio = matchesPerHundredWords / expected
//     return 1 - 1 / (1 + ratio * ratio)
//
// Verdict copy generation:
//   Generate 1-2 editorial sentences describing the specific patterns found.
//   Examples from docs/design.md §"Verdict copy":
//     74: "Heavy reliance on transitional phrases and hedging language. The structure is there — the voice isn't."
//     12: "Reads like a person wrote it. Some filler, nothing egregious."
//     91: "Almost every paragraph opens with a transitional phrase. Strong presence of power-word padding."
//   Write a small lookup/template system — do not hardcode scores.
//
// Pattern matching helpers needed:
//   - countWords(text): number
//   - matchPhrases(text, patterns): PatternMatch[]     (for phrase/word-boundary modes)
//   - matchRegex(text, patterns): PatternMatch[]       (for regex mode)
//   - extractContext(text, position, windowWords): string  (15 words either side)
//
// See docs/architecture.md §"Scoring Engine Design" for the full spec.
// Import types from src/lib/types.ts — do not redefine them here.

import type { SlopScore, CategoryResult } from "@/lib/types";
import { getGrade } from "@/lib/types";

// Re-export for consumers who only import from engine
export type { SlopScore, CategoryResult };

export function calculateScore(_text: string): SlopScore {
  // TODO: implement
  return {
    score: 0,
    grade: getGrade(0),
    verdictCopy: "Scoring engine not yet implemented.",
    categories: [],
    wordCount: 0,
    note: "Not implemented",
  };
}
