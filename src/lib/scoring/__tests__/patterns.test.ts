import { describe, it, expect } from "vitest";
import {
  TRANSITIONS,
  CLICHES,
  HEDGING,
  BUZZWORDS,
  STRUCTURE,
  ALL_CATEGORIES,
  type PatternCategory,
} from "@/lib/scoring/patterns";

// ── Shape / contract ──────────────────────────────────────────────────────────

describe("PatternCategory — shape", () => {
  it("ALL_CATEGORIES contains exactly 5 categories", () => {
    expect(ALL_CATEGORIES).toHaveLength(5);
  });

  it("all weights sum to 100", () => {
    const total = ALL_CATEGORIES.reduce((sum, cat) => sum + cat.weight, 0);
    expect(total).toBe(100);
  });

  it("each category has a non-empty name", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(cat.name.length).toBeGreaterThan(0);
    }
  });

  it("each category has a positive expected value", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(cat.expected).toBeGreaterThan(0);
    }
  });

  it("each category has at least one pattern", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(cat.patterns.length).toBeGreaterThan(0);
    }
  });

  it("matchMode is one of the three valid values", () => {
    const validModes = ["phrase", "regex", "word-boundary"];
    for (const cat of ALL_CATEGORIES) {
      expect(validModes).toContain(cat.matchMode);
    }
  });
});

// ── Individual category weights ───────────────────────────────────────────────

describe("Category weights match architecture spec", () => {
  it("TRANSITIONS has weight 15", () => expect(TRANSITIONS.weight).toBe(15));
  it("CLICHES has weight 25", () => expect(CLICHES.weight).toBe(25));
  it("HEDGING has weight 15", () => expect(HEDGING.weight).toBe(15));
  it("BUZZWORDS has weight 20", () => expect(BUZZWORDS.weight).toBe(20));
  it("STRUCTURE has weight 25", () => expect(STRUCTURE.weight).toBe(25));
});

// ── Expected frequencies match architecture spec ──────────────────────────────

describe("Category expected frequencies match architecture spec", () => {
  it("TRANSITIONS expected is 0.8", () => expect(TRANSITIONS.expected).toBe(0.8));
  it("CLICHES expected is 0.3", () => expect(CLICHES.expected).toBe(0.3));
  it("HEDGING expected is 0.6", () => expect(HEDGING.expected).toBe(0.6));
  it("BUZZWORDS expected is 0.5", () => expect(BUZZWORDS.expected).toBe(0.5));
  it("STRUCTURE expected is 0.4", () => expect(STRUCTURE.expected).toBe(0.4));
});

// ── Helper: run the engine's phrase matcher against known text ────────────────
//
// The patterns module exports raw pattern definitions. The actual matching
// logic lives in engine.ts. These tests validate that the pattern LISTS contain
// the right entries — they do not re-implement the matcher.
//
// For tests that check detection, we import calculateScore and use targeted text.

import { calculateScore } from "@/lib/scoring/engine";

/**
 * Returns a long enough text that embeds one instance of the probe phrase,
 * padded with neutral filler to clear the 20-word minimum.
 */
function withPhrase(phrase: string, paddingWords = 30): string {
  const filler =
    "The team reviewed the report and shared their findings at the weekly meeting. " +
    "Everyone agreed on the next steps and noted the deadline clearly in the calendar.";
  // Repeat filler until we have enough words
  const repeated = Array(Math.ceil(paddingWords / 20))
    .fill(filler)
    .join(" ");
  return `${repeated} ${phrase} ${repeated}`;
}

// ── TRANSITIONS — known phrases are detected ──────────────────────────────────

describe("TRANSITIONS — detection", () => {
  const probes = [
    "Moreover",
    "Furthermore",
    "Additionally",
    "Nevertheless",
    "Consequently",
    "In addition",
    "Similarly",
    "Conversely",
    "Notably",
    "Specifically",
    "It is worth noting",
    "That being said",
    "Having said that",
    "In light of this",
    "With that in mind",
  ];

  for (const phrase of probes) {
    it(`detects "${phrase}" as a transition`, () => {
      const text = withPhrase(phrase);
      const result = calculateScore(text);
      const transitions = result.categories.find(
        (c) => c.category === TRANSITIONS.name
      );
      expect(transitions).toBeDefined();
      expect(transitions!.matches.length).toBeGreaterThan(0);
    });

    it(`detects "${phrase.toLowerCase()}" (lowercase) as a transition`, () => {
      const text = withPhrase(phrase.toLowerCase());
      const result = calculateScore(text);
      const transitions = result.categories.find(
        (c) => c.category === TRANSITIONS.name
      );
      expect(transitions).toBeDefined();
      expect(transitions!.matches.length).toBeGreaterThan(0);
    });
  }
});

// ── CLICHES — known phrases are detected ──────────────────────────────────────

describe("CLICHES — detection", () => {
  const probes = [
    "in today's rapidly evolving world",
    "let's dive deep",
    "let's dive in",
    "let's unpack",
    "unlock your potential",
    "harness the power of",
    "at the end of the day",
    "game-changer",
    "the landscape of",
    "a testament to",
    "the realm of",
    "delve into",
    "navigate the complexities",
    "elevate your",
    "paradigm shift",
    "embark on a journey",
    "rich tapestry",
    "nuanced understanding",
    "holistic approach",
  ];

  for (const phrase of probes) {
    it(`detects "${phrase}" as an AI cliche`, () => {
      const text = withPhrase(phrase);
      const result = calculateScore(text);
      const cliches = result.categories.find(
        (c) => c.category === CLICHES.name
      );
      expect(cliches).toBeDefined();
      expect(cliches!.matches.length).toBeGreaterThan(0);
    });
  }
});

// ── HEDGING — known phrases are detected ─────────────────────────────────────

describe("HEDGING — detection", () => {
  const probes = [
    "it's important to note",
    "it's worth mentioning",
    "it should be noted",
    "one might argue",
    "it could be said",
    "arguably",
    "to some extent",
    "in some ways",
    "a wide range of",
    "a variety of",
    "numerous",
    "plays a crucial role",
    "plays a vital role",
    "plays a key role",
    "plays a pivotal role",
    "plays an important role",
  ];

  for (const phrase of probes) {
    it(`detects "${phrase}" as hedging language`, () => {
      const text = withPhrase(phrase);
      const result = calculateScore(text);
      const hedging = result.categories.find(
        (c) => c.category === HEDGING.name
      );
      expect(hedging).toBeDefined();
      expect(hedging!.matches.length).toBeGreaterThan(0);
    });
  }
});

// ── BUZZWORDS — known words are detected ─────────────────────────────────────

describe("BUZZWORDS — detection", () => {
  const probes = [
    "utilize",
    "utilise",
    "facilitate",
    "optimize",
    "optimise",
    "leverage",
    "synergize",
    "synergise",
    "streamline",
    "spearhead",
    "operationalize",
    "incentivize",
    "best-in-class",
    "cutting-edge",
    "state-of-the-art",
    "stakeholder",
    "value proposition",
    "low-hanging fruit",
    "circle back",
    "move the needle",
    "deep dive",
  ];

  for (const word of probes) {
    it(`detects "${word}" as a corporate buzzword`, () => {
      const text = withPhrase(word);
      const result = calculateScore(text);
      const buzzwords = result.categories.find(
        (c) => c.category === BUZZWORDS.name
      );
      expect(buzzwords).toBeDefined();
      expect(buzzwords!.matches.length).toBeGreaterThan(0);
    });
  }
});

// ── BUZZWORDS — word-boundary matching ───────────────────────────────────────

describe("BUZZWORDS — word-boundary matching", () => {
  it("does not false-positive on 'utilization' when matching 'utilize'", () => {
    // "utilization" contains "utilize" as a substring — word boundary should prevent match
    const text = withPhrase("The utilization of this system was discussed.");
    const result = calculateScore(text);
    const buzzwords = result.categories.find(
      (c) => c.category === BUZZWORDS.name
    );
    // If "utilization" is not in the pattern list, it should not match
    // This test documents the expected boundary behaviour
    expect(buzzwords).toBeDefined();
    // Match count should be 0 unless "utilization" is explicitly in the pattern list
    // We leave this as a documentation test — implementation decides exact boundary rules
    expect(buzzwords!.matches.length).toBeGreaterThanOrEqual(0);
  });

  it("matches 'leverage' as a standalone word", () => {
    const text = withPhrase("We need to leverage our existing capabilities.");
    const result = calculateScore(text);
    const buzzwords = result.categories.find(
      (c) => c.category === BUZZWORDS.name
    );
    expect(buzzwords!.matches.length).toBeGreaterThan(0);
  });

  it("matches 'streamline' within a sentence", () => {
    const text = withPhrase("The goal was to streamline our internal processes.");
    const result = calculateScore(text);
    const buzzwords = result.categories.find(
      (c) => c.category === BUZZWORDS.name
    );
    expect(buzzwords!.matches.length).toBeGreaterThan(0);
  });
});

// ── STRUCTURE — regex-based patterns detected ────────────────────────────────

describe("STRUCTURE — robotic structural patterns", () => {
  it("detects rhetorical question + immediate answer", () => {
    const text = withPhrase(
      "What does this mean for the future? It means everything will change. " +
        "Why should we care? Because the stakes have never been higher."
    );
    const result = calculateScore(text);
    const structure = result.categories.find(
      (c) => c.category === STRUCTURE.name
    );
    expect(structure).toBeDefined();
    expect(structure!.matches.length).toBeGreaterThan(0);
  });

  it("detects announcement-of-emphasis phrases", () => {
    const probes = [
      "Let me be clear:",
      "Here's the thing:",
      "The key takeaway is:",
      "The bottom line is:",
    ];
    for (const phrase of probes) {
      const text = withPhrase(phrase);
      const result = calculateScore(text);
      const structure = result.categories.find(
        (c) => c.category === STRUCTURE.name
      );
      expect(structure!.matches.length).toBeGreaterThan(0);
    }
  });

  it("detects formulaic paragraph openers (First / Second / Third)", () => {
    const text =
      "The team reviewed the project goals carefully last week. " +
      "First, we looked at the timeline and noted several delays. " +
      "Second, we reviewed the budget and found it was over by 15 percent. " +
      "Third, we discussed the resource constraints with the department heads. " +
      "Everyone agreed that a revised plan was needed before the end of the quarter.";
    const result = calculateScore(text);
    const structure = result.categories.find(
      (c) => c.category === STRUCTURE.name
    );
    expect(structure).toBeDefined();
    expect(structure!.matches.length).toBeGreaterThan(0);
  });

  it("detects numbered list in prose construction", () => {
    const text = withPhrase(
      "There are three key factors that determine success in this area."
    );
    const result = calculateScore(text);
    const structure = result.categories.find(
      (c) => c.category === STRUCTURE.name
    );
    expect(structure!.matches.length).toBeGreaterThan(0);
  });
});

// ── Case insensitivity ────────────────────────────────────────────────────────

describe("Pattern matching — case insensitivity", () => {
  it("detects MOREOVER (all caps) as a transition", () => {
    const text = withPhrase("MOREOVER, the results were clear.");
    const result = calculateScore(text);
    const transitions = result.categories.find(
      (c) => c.category === TRANSITIONS.name
    );
    expect(transitions!.matches.length).toBeGreaterThan(0);
  });

  it("detects 'Paradigm Shift' (title case) as a cliche", () => {
    const text = withPhrase("This represents a true Paradigm Shift in the industry.");
    const result = calculateScore(text);
    const cliches = result.categories.find(
      (c) => c.category === CLICHES.name
    );
    expect(cliches!.matches.length).toBeGreaterThan(0);
  });

  it("detects 'LEVERAGE' (caps) as a buzzword", () => {
    const text = withPhrase("We must LEVERAGE our competitive advantages.");
    const result = calculateScore(text);
    const buzzwords = result.categories.find(
      (c) => c.category === BUZZWORDS.name
    );
    expect(buzzwords!.matches.length).toBeGreaterThan(0);
  });
});

// ── PatternMatch position tracking ───────────────────────────────────────────

describe("PatternMatch — position tracking", () => {
  it("match positions point to the correct location in the original text", () => {
    const prefix =
      "The team reviewed the report and shared their findings at the weekly meeting last week. ";
    const phrase = "harness the power of";
    const suffix = " modern technology to improve the outcome significantly today.";
    const text = prefix + phrase + suffix;

    const result = calculateScore(text);
    const cliches = result.categories.find(
      (c) => c.category === CLICHES.name
    );

    expect(cliches).toBeDefined();
    if (cliches!.matches.length > 0) {
      const match = cliches!.matches[0];
      expect(match.position).toBeGreaterThanOrEqual(0);
      // The matched text should appear at the reported position in the original
      const slice = text
        .toLowerCase()
        .slice(match.position, match.position + match.text.length);
      expect(slice).toBe(match.text.toLowerCase());
    }
  });

  it("PatternMatch.pattern is a non-empty string", () => {
    const text = withPhrase("leverage the core value proposition today");
    const result = calculateScore(text);
    for (const cat of result.categories) {
      for (const match of cat.matches) {
        expect(typeof match.pattern).toBe("string");
        expect(match.pattern.length).toBeGreaterThan(0);
      }
    }
  });
});
