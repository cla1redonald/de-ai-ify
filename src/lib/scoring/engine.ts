// Client-side scoring engine. Pure TypeScript — no network calls.
// Importable by client components and server code alike.

import type { SlopScore, CategoryResult, PatternMatch, HighlightSpan, PatternResult, ScoreResult } from "@/lib/types";
import { getGrade } from "@/lib/types";
import { ALL_CATEGORIES, type PatternCategory } from "@/lib/scoring/patterns";
import { countWords, extractContext } from "@/lib/utils";

export type { SlopScore, CategoryResult };

// ── Density curve ──────────────────────────────────────────────────────────
// Sigmoid: 0 matches = 0, at "expected" frequency = 0.5, 2x expected ≈ 0.85, 3x+ ≈ 1.0
// Prevents short texts being penalised for a single match.
function densityCurve(matchesPerHundredWords: number, expected: number): number {
  if (matchesPerHundredWords === 0) return 0;
  const ratio = matchesPerHundredWords / expected;
  return 1 - 1 / (1 + ratio * ratio);
}

// ── Severity from density ──────────────────────────────────────────────────
function getSeverity(density: number): "low" | "medium" | "high" {
  if (density < 0.35) return "low";
  if (density < 0.65) return "medium";
  return "high";
}

// ── Phrase / word-boundary matching ───────────────────────────────────────
function matchPhrases(
  text: string,
  patterns: Array<string | RegExp>,
  mode: "phrase" | "word-boundary"
): PatternMatch[] {
  const lower = text.toLowerCase();
  const matches: PatternMatch[] = [];

  for (const pattern of patterns) {
    if (pattern instanceof RegExp) continue; // handled in matchRegex
    const phrase = (pattern as string).toLowerCase();

    let searchFrom = 0;
    while (true) {
      const idx = lower.indexOf(phrase, searchFrom);
      if (idx === -1) break;

      if (mode === "word-boundary") {
        // Ensure we're at a word boundary
        const before = idx === 0 ? " " : lower[idx - 1];
        const after = idx + phrase.length >= lower.length ? " " : lower[idx + phrase.length];
        const wordChar = /\w/;
        if (wordChar.test(before) || wordChar.test(after)) {
          searchFrom = idx + 1;
          continue;
        }
      }

      matches.push({
        pattern: pattern as string,
        text: text.slice(idx, idx + phrase.length),
        position: idx,
      });
      searchFrom = idx + phrase.length;
    }
  }

  return matches;
}

// ── Regex matching ─────────────────────────────────────────────────────────
function matchRegex(text: string, patterns: Array<string | RegExp>): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const pattern of patterns) {
    if (!(pattern instanceof RegExp)) continue;

    // Reset lastIndex for global regexes
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        pattern: pattern.source,
        text: m[0],
        position: m.index,
      });
      // Prevent infinite loop on zero-length matches
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  return matches;
}

// ── Category analyser ──────────────────────────────────────────────────────
function analyseCategory(
  text: string,
  wordCount: number,
  category: PatternCategory
): CategoryResult {
  let rawMatches: PatternMatch[];

  if (category.matchMode === "regex") {
    rawMatches = matchRegex(text, category.patterns);
  } else {
    rawMatches = matchPhrases(text, category.patterns, category.matchMode);
  }

  // De-duplicate overlapping matches (keep the longer one)
  const deduped: PatternMatch[] = [];
  const sortedByPos = rawMatches.slice().sort((a, b) => a.position - b.position);
  let lastEnd = -1;
  for (const m of sortedByPos) {
    if (m.position >= lastEnd) {
      deduped.push(m);
      lastEnd = m.position + m.text.length;
    } else if (m.text.length > (deduped[deduped.length - 1]?.text.length ?? 0)) {
      deduped[deduped.length - 1] = m;
      lastEnd = m.position + m.text.length;
    }
  }

  const matchCount = deduped.length;
  const matchesPerHundredWords = (matchCount / wordCount) * 100;
  const density = densityCurve(matchesPerHundredWords, category.expected);

  return {
    category: category.name,
    weight: category.weight,
    matches: deduped,
    density,
    severity: getSeverity(density),
  };
}

// ── Verdict copy generation ────────────────────────────────────────────────
function generateVerdict(score: number, categories: CategoryResult[]): string {
  const topCategories = categories
    .filter((c) => c.density > 0.1)
    .sort((a, b) => b.density * b.weight - a.density * a.weight);

  const topName = topCategories[0]?.category ?? null;
  const secondName = topCategories[1]?.category ?? null;

  if (score <= 10) {
    return "Reads like a person wrote it. Clean structure, original phrasing, no obvious tells.";
  }
  if (score <= 20) {
    return "Mostly human. A few clichéd phrases here and there, but nothing that raises flags.";
  }
  if (score <= 30) {
    return "Generally readable, with some habitual filler. Could tighten the phrasing in places.";
  }
  if (score <= 45) {
    if (topName && secondName) {
      return `Some AI patterns showing through — particularly ${topName.toLowerCase()} and ${secondName.toLowerCase()}. The ideas are there; the voice isn't quite.`;
    }
    if (topName) {
      return `Moderate ${topName.toLowerCase()} dragging down the score. The content has merit; the delivery is formulaic.`;
    }
    return "Some AI patterning present. The writing is functional but follows predictable templates.";
  }
  if (score <= 60) {
    if (topName && secondName) {
      return `Heavy ${topName.toLowerCase()} and ${secondName.toLowerCase()}. This reads like it was written to a template rather than a thought.`;
    }
    if (topName) {
      return `The ${topName.toLowerCase()} here is significant. You can feel the formula underneath every paragraph.`;
    }
    return "The pattern density is high. Several categories are firing — this prose has the texture of generated text.";
  }
  if (score <= 75) {
    if (topName) {
      return `Strong presence of ${topName.toLowerCase()}${secondName ? ` and ${secondName.toLowerCase()}` : ""}. The structure is recognisable from a hundred LinkedIn posts.`;
    }
    return "Almost every paragraph exhibits AI-writing tells. Transitions, hedges, and buzzwords stack up quickly.";
  }
  if (score <= 90) {
    return `Almost every marker is firing. ${topName ? `The ${topName.toLowerCase()} alone accounts for much of this. ` : ""}This reads like a Tuesday morning prompt with a "make it professional" suffix.`;
  }
  return "This is textbook slop. Every category is saturated — transitions, clichés, structural templates, the lot. Yikes.";
}

// ── Main export ────────────────────────────────────────────────────────────
export function calculateScore(text: string): SlopScore {
  const wordCount = countWords(text);

  if (wordCount < 20) {
    return {
      score: 0,
      grade: "human",
      verdictCopy: "Paste at least a few sentences for an accurate score.",
      categories: [],
      wordCount,
      note: "Text too short to score",
    };
  }

  const categories = ALL_CATEGORIES.map((cat) =>
    analyseCategory(text, wordCount, cat)
  );

  // Weighted sum: max possible = sum of all weights = 100
  const raw = categories.reduce((sum, c) => sum + c.density * c.weight, 0);
  const score = Math.min(100, Math.round(raw));
  const grade = getGrade(score);
  const verdictCopy = generateVerdict(score, categories);

  return { score, grade, verdictCopy, categories, wordCount };
}

// ── Transform to UI ScoreResult ────────────────────────────────────────────
// Converts the raw SlopScore into the ScoreResult shape the UI consumes.
export function toScoreResult(slopScore: SlopScore, originalText: string): ScoreResult {
  const patterns: PatternResult[] = slopScore.categories
    .filter((c) => c.matches.length > 0)
    .map((c) => ({
      category: c.category,
      count: c.matches.length,
      severity: c.severity,
      instances: c.matches.slice(0, 8).map((m) =>
        extractContext(originalText, m.position, m.text.length, 12)
      ),
    }));

  const highlights: HighlightSpan[] = slopScore.categories.flatMap((c) =>
    c.matches.map((m) => ({
      start: m.position,
      end: m.position + m.text.length,
      category: c.category,
    }))
  );

  return {
    score: slopScore.score,
    grade: slopScore.grade,
    verdictCopy: slopScore.verdictCopy,
    patterns,
    originalText,
    highlights,
    wordCount: slopScore.wordCount,
  };
}
