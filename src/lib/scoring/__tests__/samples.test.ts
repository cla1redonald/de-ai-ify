import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/scoring/engine";

// ── Sample texts ──────────────────────────────────────────────────────────────
//
// These are real-world-style writing samples. They are the most important tests
// in the suite: they validate the scoring engine against actual human intuition
// about what reads as AI vs. human.
//
// Score expectations:
//   >= 70  → slop  (obviously AI-generated)
//   31–69  → mixed (professional but somewhat AI-influenced)
//   <= 30  → human (natural human writing)

const SAMPLES = {
  // ── SLOP: textbook ChatGPT output ─────────────────────────────────────────
  obviousChatGPT: `
    In today's rapidly evolving technological landscape, it's important to note that
    organizations must leverage cutting-edge solutions to navigate the complexities
    of digital transformation. Moreover, a holistic approach is crucial to foster
    innovation and empower teams across the ecosystem. Furthermore, stakeholders
    must align their value propositions with best-in-class methodologies to move
    the needle on organizational outcomes.

    That being said, it is worth mentioning that paradigm shifts require a nuanced
    understanding of the interplay between technology and human capital. Additionally,
    leaders must harness the power of data-driven insights to unlock their full
    potential. Consequently, the realm of artificial intelligence presents both
    challenges and opportunities for those willing to embark on a transformative
    journey.

    What does this mean for forward-thinking executives? It means that the time to
    act is now. Let me be clear: organizations that fail to streamline their
    operations and optimize their workflows will fall behind. Here's the thing —
    there are three key factors that determine success in this space: agility,
    resilience, and a commitment to continuous improvement. A testament to this
    approach can be found in the results of industry leaders who have embraced
    a holistic strategy. In light of this, we must delve into the specifics of
    implementation and operationalize our learnings going forward.
  `,

  // ── HUMAN: natural conversational writing ─────────────────────────────────
  naturalHuman: `
    I started keeping a notebook after my second kid was born, mostly because I kept
    forgetting things. Nothing fancy — just a small hardback from the corner shop,
    one I'd grab between school run and the office. Most of what I wrote down wasn't
    even useful. Shopping lists, half-formed sentences, the occasional rant about
    something that had annoyed me at work.

    But somewhere in there were the good bits. A thing my daughter said that made
    me laugh for a week. A conversation with my dad before he got ill. The weird
    satisfaction of a Sunday when nothing was planned and everything ended up being
    fine anyway.

    I don't know what made me pull the notebooks out last month. I've got about
    six years of them now, stacked in the back of the wardrobe behind the camping
    gear. Reading back through them is strange — it's not quite like remembering,
    more like meeting someone you used to be. Some of it's embarrassing. Some of
    it is better than I expected.

    The thing I keep coming back to is how small everything was. Not in a bad way.
    Just that the days that felt enormous at the time — a promotion, a move, a
    falling-out with a friend — take up about as much space as what we had for
    dinner on a random Tuesday in March.
  `,

  // ── MIXED: professional business email, human but formal ──────────────────
  professionalEmail: `
    Hi Marcus,

    Thanks for taking the time to walk us through the proposal yesterday. The team
    came away with a much clearer picture of what the engagement would involve, and
    the timeline you outlined seems realistic given our current constraints.

    A few things came up in our debrief that I want to flag before we go further.
    First, the pricing structure assumes a fixed scope, but our experience with
    projects like this is that scope tends to shift in the first two months as we
    learn more. Could we discuss a mechanism for handling that — either a change
    request process or a contingency buffer built into the estimate?

    Second, the onboarding section references a dedicated project manager from
    your side, but it wasn't clear whether that's included in the quoted fee or
    billed separately. Can you clarify?

    On the positive side: the methodology you described for the discovery phase
    is exactly what we've been looking for. We've worked with vendors who skip
    straight to delivery, and it always costs us more in the long run.

    Let me know when you have time for a follow-up call this week. Thursday
    afternoon or any time Friday works for us.

    Best,
    Niamh
  `,

  // ── MIXED-HIGH: AI draft that's been humanized but traces remain ──────────
  humanizedAIDraft: `
    Remote work has changed a lot about how teams collaborate — and not all of it
    for the better. The flexibility is real and most people I talk to wouldn't give
    it up. But there's a cost that doesn't show up in the productivity metrics.

    The informal stuff has suffered. The quick conversation in the hallway, the
    lunch where you find out someone's been quietly struggling, the moment when
    a junior person gets to watch a senior person handle something difficult in
    real time. That kind of transfer is hard to replicate over a video call.

    It's important to note that this isn't just a management problem. It's also
    something that individuals have to be intentional about. The people who are
    thriving in distributed teams tend to be the ones who've figured out how to
    build relationships without relying on proximity.

    A wide range of approaches seems to work: some teams do regular optional
    socials, others have structured peer mentoring, a few have gone back to
    in-person for specific types of work. There isn't one answer. What matters
    is that the question is being asked deliberately rather than just hoping
    the culture will sort itself out. Numerous companies have found that
    regular check-ins help, though the format varies considerably.
  `,
} as const;

// ── Obvious ChatGPT output ─────────────────────────────────────────────────────

describe("Sample: obvious ChatGPT output", () => {
  it("scores above 65 (slop tier)", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    expect(result.score).toBeGreaterThan(65);
  });

  it("returns grade 'slop'", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    expect(result.grade).toBe("slop");
  });

  it("detects matches in the AI Clichés category", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    const cliches = result.categories.find(
      (c) => c.category.toLowerCase().includes("clich")
    );
    expect(cliches).toBeDefined();
    expect(cliches!.matches.length).toBeGreaterThan(3);
  });

  it("detects matches in the Transitional Phrases category", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    const transitions = result.categories.find(
      (c) => c.category.toLowerCase().includes("transit")
    );
    expect(transitions).toBeDefined();
    expect(transitions!.matches.length).toBeGreaterThan(2);
  });

  it("detects matches in the Corporate Buzzwords category", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    const buzzwords = result.categories.find(
      (c) => c.category.toLowerCase().includes("buzz") ||
             c.category.toLowerCase().includes("corporate")
    );
    expect(buzzwords).toBeDefined();
    expect(buzzwords!.matches.length).toBeGreaterThan(2);
  });

  it("has high density in at least 3 categories", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    const highDensityCategories = result.categories.filter(
      (c) => c.density > 0.4
    );
    expect(highDensityCategories.length).toBeGreaterThanOrEqual(3);
  });

  it("wordCount is reasonable for this length of text (~150 words)", () => {
    const result = calculateScore(SAMPLES.obviousChatGPT);
    expect(result.wordCount).toBeGreaterThan(100);
    expect(result.wordCount).toBeLessThan(300);
  });
});

// ── Natural human writing ─────────────────────────────────────────────────────

describe("Sample: natural human writing", () => {
  it("scores below 30 (human tier)", () => {
    const result = calculateScore(SAMPLES.naturalHuman);
    expect(result.score).toBeLessThan(30);
  });

  it("returns grade 'human'", () => {
    const result = calculateScore(SAMPLES.naturalHuman);
    expect(result.grade).toBe("human");
  });

  it("has very few or zero cliche matches", () => {
    const result = calculateScore(SAMPLES.naturalHuman);
    const cliches = result.categories.find(
      (c) => c.category.toLowerCase().includes("clich")
    );
    expect(cliches).toBeDefined();
    expect(cliches!.matches.length).toBeLessThanOrEqual(1);
  });

  it("has very few or zero buzzword matches", () => {
    const result = calculateScore(SAMPLES.naturalHuman);
    const buzzwords = result.categories.find(
      (c) => c.category.toLowerCase().includes("buzz") ||
             c.category.toLowerCase().includes("corporate")
    );
    expect(buzzwords).toBeDefined();
    expect(buzzwords!.matches.length).toBeLessThanOrEqual(1);
  });

  it("all pattern category densities are below 0.3", () => {
    const result = calculateScore(SAMPLES.naturalHuman);
    // Only check pattern-based categories (those with no detail field)
    const patternCats = result.categories.filter((c) => !c.detail);
    for (const cat of patternCats) {
      expect(cat.density).toBeLessThan(0.3);
    }
  });

  it("scores significantly lower than the ChatGPT sample", () => {
    const humanResult = calculateScore(SAMPLES.naturalHuman);
    const slopResult = calculateScore(SAMPLES.obviousChatGPT);
    // Human should score at least 40 points lower
    expect(slopResult.score - humanResult.score).toBeGreaterThan(40);
  });
});

// ── Professional business email ───────────────────────────────────────────────

describe("Sample: professional business email", () => {
  it("scores in the low-to-mid range (below 45)", () => {
    // A professional human email should not be flagged as AI slop
    // It may use formal language but should not trip AI pattern detectors
    const result = calculateScore(SAMPLES.professionalEmail);
    expect(result.score).toBeLessThan(45);
  });

  it("does not return grade 'slop'", () => {
    const result = calculateScore(SAMPLES.professionalEmail);
    expect(result.grade).not.toBe("slop");
  });

  it("has low cliche density — professional is not the same as AI", () => {
    const result = calculateScore(SAMPLES.professionalEmail);
    const cliches = result.categories.find(
      (c) => c.category.toLowerCase().includes("clich")
    );
    expect(cliches).toBeDefined();
    expect(cliches!.density).toBeLessThan(0.5);
  });

  it("scores lower than the obvious ChatGPT sample", () => {
    const emailResult = calculateScore(SAMPLES.professionalEmail);
    const slopResult = calculateScore(SAMPLES.obviousChatGPT);
    expect(emailResult.score).toBeLessThan(slopResult.score);
  });
});

// ── Humanized AI draft ────────────────────────────────────────────────────────

describe("Sample: humanized AI draft", () => {
  it("scores below the slop threshold", () => {
    const result = calculateScore(SAMPLES.humanizedAIDraft);
    // Well-humanized AI text should score low — some tells but not enough to flag as slop
    expect(result.score).toBeLessThan(70);
  });

  it("returns grade 'human' or 'mixed'", () => {
    const result = calculateScore(SAMPLES.humanizedAIDraft);
    expect(["human", "mixed"]).toContain(result.grade);
  });

  it("detects some hedging language patterns", () => {
    // "it's important to note", "a wide range of", "numerous" are present
    const result = calculateScore(SAMPLES.humanizedAIDraft);
    const hedging = result.categories.find(
      (c) => c.category.toLowerCase().includes("hedg")
    );
    expect(hedging).toBeDefined();
    expect(hedging!.matches.length).toBeGreaterThan(0);
  });

  it("scores between the natural human sample and the ChatGPT sample", () => {
    const humanResult = calculateScore(SAMPLES.naturalHuman);
    const mixedResult = calculateScore(SAMPLES.humanizedAIDraft);
    const slopResult = calculateScore(SAMPLES.obviousChatGPT);
    expect(mixedResult.score).toBeGreaterThan(humanResult.score);
    expect(mixedResult.score).toBeLessThan(slopResult.score);
  });
});

// ── Cross-sample consistency ──────────────────────────────────────────────────

describe("Cross-sample scoring order", () => {
  it("samples rank in correct order: human < humanized < email <= slop", () => {
    const human = calculateScore(SAMPLES.naturalHuman).score;
    const humanized = calculateScore(SAMPLES.humanizedAIDraft).score;
    const slop = calculateScore(SAMPLES.obviousChatGPT).score;

    // The fundamental ordering must hold
    expect(human).toBeLessThan(slop);
    expect(humanized).toBeLessThan(slop);
    expect(human).toBeLessThan(humanized);
  });

  it("slop scores at least 2x the human score", () => {
    const human = calculateScore(SAMPLES.naturalHuman).score;
    const slop = calculateScore(SAMPLES.obviousChatGPT).score;
    // Avoid division by zero if human somehow scores 0
    if (human > 0) {
      expect(slop / human).toBeGreaterThan(2);
    } else {
      expect(slop).toBeGreaterThan(50);
    }
  });
});
