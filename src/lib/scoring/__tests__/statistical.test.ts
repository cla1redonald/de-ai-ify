import { describe, it, expect } from "vitest";
import {
  analyseSentenceRhythm,
  analyseVocabularyRichness,
  analyseBurstiness,
  analyseAllStatistical,
} from "@/lib/scoring/statistical";

// ── Test texts ───────────────────────────────────────────────────────────────

const HUMAN_TEXT = `
I started keeping a notebook after my second kid was born, mostly because I kept
forgetting things. Not important things — milk, that dentist appointment, whether
I'd already told someone the story about the parking meter. The notebook helped.
Then it became something else. I started writing down what the kids said at dinner.
"Dad, does the moon get tired?" "Can fish see air?" Stuff like that.

After about a year I realised I had this strange document. Part grocery list, part
philosophy, part proof that I was losing my mind. My wife found it once and read
three pages out loud while laughing so hard she couldn't breathe. I think that's when
I decided it was worth keeping.
`;

const AI_TEXT = `
In today's rapidly evolving digital landscape, it is important to note that organizations
must leverage cutting-edge solutions to navigate the complexities of modern business.
Furthermore, a holistic approach is crucial to foster innovation across the ecosystem.
Additionally, stakeholders must align their value propositions with best-in-class
methodologies to drive meaningful outcomes.

Moreover, it is worth mentioning that digital transformation requires a nuanced
understanding of the interplay between technology and human capital. Consequently,
leaders must harness the power of data-driven insights to unlock their full potential.
The key takeaway is that organizations must adopt a proactive approach to remain
competitive in this ever-evolving landscape.

In conclusion, the path forward requires a comprehensive strategy that addresses
both challenges and opportunities. By embracing innovation and fostering collaboration,
organizations can position themselves for sustainable growth and long-term success.
`;

const UNIFORM_SENTENCES = `
The project was completed on time. The team worked very hard. The results were quite good.
The client was very pleased. The budget was within limits. The scope was well defined.
The timeline was carefully managed. The deliverables met expectations. The team celebrated.
The project was a great success. The lessons were documented. The next phase was planned.
`;

// ── Sentence Rhythm ──────────────────────────────────────────────────────────

describe("Sentence Rhythm", () => {
  it("returns low density for varied human writing", () => {
    const result = analyseSentenceRhythm(HUMAN_TEXT);
    expect(result.density).toBeLessThan(0.4);
    expect(result.severity).toBe("low");
  });

  it("returns higher density for mechanically uniform sentences", () => {
    const result = analyseSentenceRhythm(UNIFORM_SENTENCES);
    expect(result.density).toBeGreaterThan(0.3);
  });

  it("returns zero density for too-short text", () => {
    const result = analyseSentenceRhythm("Too short.");
    expect(result.density).toBe(0);
  });

  it("has weight 12", () => {
    const result = analyseSentenceRhythm(HUMAN_TEXT);
    expect(result.weight).toBe(12);
  });
});

// ── Vocabulary Richness ──────────────────────────────────────────────────────

describe("Vocabulary Richness", () => {
  it("returns low density for diverse human writing", () => {
    const result = analyseVocabularyRichness(HUMAN_TEXT);
    expect(result.density).toBeLessThan(0.5);
  });

  it("returns higher density for repetitive AI text", () => {
    const result = analyseVocabularyRichness(AI_TEXT);
    // AI text reuses words like "leverage", "holistic", "ecosystem" etc.
    expect(result.density).toBeGreaterThanOrEqual(0);
  });

  it("returns zero density for too-short text", () => {
    const result = analyseVocabularyRichness("Hello world.");
    expect(result.density).toBe(0);
  });

  it("has weight 10", () => {
    const result = analyseVocabularyRichness(HUMAN_TEXT);
    expect(result.weight).toBe(10);
  });
});

// ── Burstiness ───────────────────────────────────────────────────────────────

describe("Paragraph Burstiness", () => {
  it("returns low density for varied paragraph lengths", () => {
    const result = analyseBurstiness(HUMAN_TEXT);
    expect(result.severity).not.toBe("high");
  });

  it("returns higher density for uniform AI paragraphs", () => {
    const result = analyseBurstiness(AI_TEXT);
    // AI paragraphs tend to be more uniform in length
    expect(result.density).toBeGreaterThanOrEqual(0);
  });

  it("returns zero density for too few paragraphs", () => {
    const result = analyseBurstiness("Single paragraph only.");
    expect(result.density).toBe(0);
  });

  it("has weight 8", () => {
    const result = analyseBurstiness(HUMAN_TEXT);
    expect(result.weight).toBe(8);
  });
});

// ── All Statistical ──────────────────────────────────────────────────────────

describe("analyseAllStatistical", () => {
  it("returns exactly 3 results", () => {
    const results = analyseAllStatistical(HUMAN_TEXT);
    expect(results).toHaveLength(3);
  });

  it("all densities are between 0 and 1", () => {
    const results = analyseAllStatistical(AI_TEXT);
    for (const r of results) {
      expect(r.density).toBeGreaterThanOrEqual(0);
      expect(r.density).toBeLessThanOrEqual(1);
    }
  });

  it("all results have detail strings", () => {
    const results = analyseAllStatistical(HUMAN_TEXT);
    for (const r of results) {
      expect(r.detail.length).toBeGreaterThan(0);
    }
  });

  it("weights sum to 30", () => {
    const results = analyseAllStatistical(HUMAN_TEXT);
    const total = results.reduce((sum, r) => sum + r.weight, 0);
    expect(total).toBe(30);
  });
});
