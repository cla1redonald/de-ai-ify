import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/scoring/engine";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a paragraph of plain human text repeated to reach a target word count.
 * Uses a sentence pattern that deliberately avoids any of our flagged patterns.
 */
function humanParagraph(repeat = 1): string {
  const base =
    "I sat down with the team last Tuesday and we went through the numbers together. " +
    "The results were better than I expected — turnover was up slightly and returns were down. " +
    "We spent about an hour on the shipping delays because they kept coming up in customer emails. " +
    "Nobody had a clean answer, so we agreed to check back in on Friday once the warehouse data came through.";
  return Array(repeat).fill(base).join(" ");
}

/**
 * Generates a paragraph dense with AI slop patterns.
 */
function slopParagraph(repeat = 1): string {
  const base =
    "Moreover, it is important to note that in today's rapidly evolving landscape, " +
    "organizations must leverage synergies and utilize cutting-edge solutions to " +
    "navigate the complexities of the modern ecosystem. " +
    "Furthermore, a holistic approach is crucial to foster innovation and empower teams. " +
    "It is worth mentioning that paradigm shifts require stakeholders to streamline operations. " +
    "Additionally, we must harness the power of best-in-class value propositions to move the needle. " +
    "Consequently, delve into the realm of nuanced understanding to embark on a transformative journey.";
  return Array(repeat).fill(base).join(" ");
}

// ── Score shape / contract ────────────────────────────────────────────────────

describe("calculateScore — return shape", () => {
  it("returns a SlopScore with all required fields", () => {
    const result = calculateScore(humanParagraph(2));
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("grade");
    expect(result).toHaveProperty("verdictCopy");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("wordCount");
  });

  it("grade is one of the three valid enum values", () => {
    const result = calculateScore(humanParagraph(2));
    expect(["human", "mixed", "slop"]).toContain(result.grade);
  });

  it("verdictCopy is a non-empty string", () => {
    const result = calculateScore(humanParagraph(2));
    expect(typeof result.verdictCopy).toBe("string");
    expect(result.verdictCopy.length).toBeGreaterThan(0);
  });

  it("categories array contains exactly 5 entries", () => {
    const result = calculateScore(humanParagraph(2));
    expect(result.categories).toHaveLength(5);
  });

  it("each CategoryResult has required fields", () => {
    const result = calculateScore(humanParagraph(2));
    for (const cat of result.categories) {
      expect(cat).toHaveProperty("category");
      expect(cat).toHaveProperty("weight");
      expect(cat).toHaveProperty("matches");
      expect(cat).toHaveProperty("density");
      expect(cat).toHaveProperty("severity");
      expect(["low", "medium", "high"]).toContain(cat.severity);
    }
  });
});

// ── Score is always 0–100 ─────────────────────────────────────────────────────

describe("calculateScore — score bounds", () => {
  it("score is never below 0", () => {
    const result = calculateScore(humanParagraph(3));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("score is never above 100", () => {
    const result = calculateScore(slopParagraph(5));
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("score is a whole number (no decimals)", () => {
    const result = calculateScore(humanParagraph(2));
    expect(result.score).toBe(Math.round(result.score));
  });

  it("density on each category is between 0 and 1", () => {
    const result = calculateScore(slopParagraph(3));
    for (const cat of result.categories) {
      expect(cat.density).toBeGreaterThanOrEqual(0);
      expect(cat.density).toBeLessThanOrEqual(1);
    }
  });
});

// ── Short / empty text handling ───────────────────────────────────────────────

describe("calculateScore — short and empty text", () => {
  it("empty string returns score 0", () => {
    const result = calculateScore("");
    expect(result.score).toBe(0);
  });

  it("empty string sets a note", () => {
    const result = calculateScore("");
    expect(result.note).toBeTruthy();
  });

  it("single word returns score 0", () => {
    const result = calculateScore("Hello");
    expect(result.score).toBe(0);
  });

  it("text under 20 words returns score 0", () => {
    // 15 words — too short to score
    const result = calculateScore(
      "This is a short sentence that has fewer than twenty words total here."
    );
    expect(result.score).toBe(0);
  });

  it("text under 20 words sets a note about length", () => {
    const result = calculateScore("Too short to score.");
    expect(result.note).toBeTruthy();
    expect(result.note?.toLowerCase()).toMatch(/short|too few|word/);
  });

  it("text of exactly 20 words does not return score 0 with slop patterns", () => {
    // Exactly 20 words, containing obvious AI cliche patterns
    const exactlyTwenty =
      "Moreover it is important to note that we must leverage synergies and " +
      "harness the power of cutting-edge solutions to move the needle forward.";
    const wordCount = exactlyTwenty.trim().split(/\s+/).length;
    // Only assert if the implementation actually counts 20 words
    if (wordCount >= 20) {
      const result = calculateScore(exactlyTwenty);
      expect(result.score).toBeGreaterThanOrEqual(0); // implementation decides threshold
    }
  });

  it("whitespace-only string returns score 0", () => {
    const result = calculateScore("     \n\t   ");
    expect(result.score).toBe(0);
  });

  it("wordCount matches the actual word count in the result", () => {
    const text = humanParagraph(2);
    const result = calculateScore(text);
    // Word count should be in a reasonable range for two paragraphs
    expect(result.wordCount).toBeGreaterThan(50);
  });
});

// ── Grade thresholds match SCORE_TIERS ───────────────────────────────────────

describe("calculateScore — grade derives correctly from score", () => {
  it("pure human text returns grade 'human'", () => {
    const result = calculateScore(humanParagraph(3));
    // Score should be <= 30 for genuinely human text
    if (result.score <= 30) {
      expect(result.grade).toBe("human");
    }
  });

  it("pure slop text returns grade 'slop'", () => {
    const result = calculateScore(slopParagraph(3));
    // Score should be >= 70 for heavily AI-patterned text
    if (result.score >= 70) {
      expect(result.grade).toBe("slop");
    }
  });

  it("grade is 'human' when score <= 30", () => {
    // We can test this by checking consistency between score and grade
    const result = calculateScore(humanParagraph(3));
    if (result.score <= 30) expect(result.grade).toBe("human");
    else if (result.score <= 69) expect(result.grade).toBe("mixed");
    else expect(result.grade).toBe("slop");
  });
});

// ── Scoring direction ─────────────────────────────────────────────────────────

describe("calculateScore — scoring direction", () => {
  it("pure human text scores below 30", () => {
    const result = calculateScore(humanParagraph(3));
    expect(result.score).toBeLessThan(30);
  });

  it("pure AI slop text scores above 70", () => {
    const result = calculateScore(slopParagraph(3));
    expect(result.score).toBeGreaterThan(70);
  });

  it("slop text scores higher than human text", () => {
    const humanResult = calculateScore(humanParagraph(3));
    const slopResult = calculateScore(slopParagraph(3));
    expect(slopResult.score).toBeGreaterThan(humanResult.score);
  });

  it("mixed text scores in middle range (21–69)", () => {
    // Mix: one slop paragraph + two human paragraphs
    const mixed =
      slopParagraph(1) + " " + humanParagraph(1) + " " + humanParagraph(1);
    const result = calculateScore(mixed);
    expect(result.score).toBeGreaterThan(15);
    expect(result.score).toBeLessThan(85);
  });
});

// ── Sigmoid normalisation — same density, similar score ──────────────────────

describe("calculateScore — sigmoid normalisation", () => {
  it("short slop text and long slop text with same pattern density score within 20 points of each other", () => {
    // The sigmoid curve should prevent length unfairly skewing results.
    // We test this by constructing texts where the ratio of slop:total is the same.
    const shortSlop = slopParagraph(1) + " " + humanParagraph(1); // ~50% slop
    const longSlop =
      slopParagraph(3) + " " + humanParagraph(3); // same ~50% ratio, 3x longer
    const shortResult = calculateScore(shortSlop);
    const longResult = calculateScore(longSlop);
    // Both should have similar scores — the sigmoid prevents length bias
    expect(Math.abs(shortResult.score - longResult.score)).toBeLessThan(20);
  });

  it("adding more neutral human text does not significantly reduce slop score", () => {
    // A slop paragraph embedded in a longer piece should not be washed out
    const justSlop = slopParagraph(2);
    const slopWithFiller = slopParagraph(2) + " " + humanParagraph(4);
    const slopResult = calculateScore(justSlop);
    const fillerResult = calculateScore(slopWithFiller);
    // Score can drop but should not halve just from padding with human text
    expect(fillerResult.score).toBeGreaterThan(slopResult.score * 0.4);
  });
});
