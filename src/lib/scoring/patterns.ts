// TODO(@engineer): Pattern definitions for the scoring engine.
//
// All five pattern categories are defined here as typed constants.
// The engine (engine.ts) imports and iterates them.
//
// Structure per category:
//   - name: display name shown in the UI
//   - weight: contribution to total score (all weights sum to 100)
//   - expected: matches per 100 words that represents "normal" prose (tuning value)
//   - patterns: array of string literals or RegExp objects to match against
//   - matchMode: 'phrase' (case-insensitive substring) | 'regex' | 'word-boundary'
//
// See docs/architecture.md §"Pattern Categories" for the full list and rationale.
// Expected frequencies table is in §"Scoring Algorithm".
//
// IMPORTANT: Patterns are matched against lowercased text for phrase/word modes.
// Regex patterns should use the 'i' flag and be tested against real text samples
// before finalising — false positives on legitimate business writing are a known risk.

export interface PatternCategory {
  name: string;
  weight: number;
  expected: number;
  matchMode: "phrase" | "regex" | "word-boundary";
  patterns: Array<string | RegExp>;
}

// Category 1 — Overused Transitions (weight: 15, expected: 0.8/100 words)
// Must appear as sentence starters or after comma/semicolon.
export const TRANSITIONS: PatternCategory = {
  name: "Transitional Phrases",
  weight: 15,
  expected: 0.8,
  matchMode: "phrase",
  patterns: [
    // TODO: implement full list from docs/architecture.md §1
    // "moreover", "furthermore", "additionally", "nevertheless", "consequently",
    // "in addition", "similarly", "conversely", "notably", "specifically",
    // "it is worth noting", "that being said", "having said that",
    // "in light of this", "with that in mind",
  ],
};

// Category 2 — AI Clichés (weight: 25, expected: 0.3/100 words)
// Partial phrase matches within a sentence.
export const CLICHES: PatternCategory = {
  name: "AI Clichés",
  weight: 25,
  expected: 0.3,
  matchMode: "phrase",
  patterns: [
    // TODO: implement full list from docs/architecture.md §2
    // "in today's", "let's dive", "unlock your potential", "harness the power of",
    // "at the end of the day", "game-changer", "it's not just about",
    // "the landscape of", "a testament to", "the realm of", "delve into",
    // "navigate the complexities", "elevate your", "empower", "foster innovation",
    // "paradigm shift", "embark on", "rich tapestry", "nuanced understanding",
    // "holistic approach",
  ],
};

// Category 3 — Hedging Language (weight: 15, expected: 0.6/100 words)
export const HEDGING: PatternCategory = {
  name: "Hedging Language",
  weight: 15,
  expected: 0.6,
  matchMode: "phrase",
  patterns: [
    // TODO: implement full list from docs/architecture.md §3
    // "it's important to note", "it's worth mentioning", "it should be noted",
    // "one might argue", "it could be said", "arguably", "to some extent",
    // "in some ways", "a wide range of", "a variety of", "numerous",
    // "plays a crucial role", "plays a vital role", "plays a key role",
    // "plays a pivotal role", "plays an important role",
  ],
};

// Category 4 — Corporate Buzzwords (weight: 20, expected: 0.5/100 words)
export const BUZZWORDS: PatternCategory = {
  name: "Corporate Buzzwords",
  weight: 20,
  expected: 0.5,
  matchMode: "word-boundary",
  patterns: [
    // TODO: implement full list from docs/architecture.md §4
    // "utilize", "utilise", "facilitate", "optimize", "optimise",
    // "leverage", "synergize", "synergise", "streamline", "spearhead",
    // "operationalize", "incentivize", "best-in-class", "cutting-edge",
    // "state-of-the-art", "stakeholder", "value proposition",
    // "low-hanging fruit", "circle back", "move the needle", "deep dive",
  ],
};

// Category 5 — Robotic Structural Patterns (weight: 25, expected: 0.4/100 words)
// These require regex — they detect structural patterns, not just phrases.
export const STRUCTURE: PatternCategory = {
  name: "Robotic Structure",
  weight: 25,
  expected: 0.4,
  matchMode: "regex",
  patterns: [
    // TODO: implement regex patterns from docs/architecture.md §5:
    //
    // 1. Rhetorical question + immediate answer:
    //    /\?[^.!?]*\./g  — needs context-aware detection
    //
    // 2. Triple structure (exactly 3 parallel items):
    //    /\b\w+(?:\s+\w+)?,\s+\w+(?:\s+\w+)?,?\s+and\s+\w+(?:\s+\w+)?\b/gi
    //    (detect 3+ occurrences in same text)
    //
    // 3. Announcement of emphasis:
    //    /\b(let me be clear|here's the thing|the key takeaway is|the bottom line is)\b/gi
    //
    // 4. Formulaic paragraph openers:
    //    /^(first|second|third|one|another|finally)[,.:]/gim
    //
    // 5. Excessive colons for dramatic effect:
    //    /\w[^.!?]*:/g  — count 3+ per 300 words
    //
    // 6. Numbered list in prose:
    //    /there are (three|four|five|\d+) (key )?(\w+ ){0,2}(factors|reasons|ways|steps|things)/gi
  ],
};

export const ALL_CATEGORIES: PatternCategory[] = [
  TRANSITIONS,
  CLICHES,
  HEDGING,
  BUZZWORDS,
  STRUCTURE,
];
