// Pattern definitions for the scoring engine.
//
// All five pattern categories defined as typed constants.
// The engine (engine.ts) imports and iterates them.

export interface PatternCategory {
  name: string;
  weight: number;
  expected: number; // matches per 100 words representing "normal" prose
  matchMode: "phrase" | "regex" | "word-boundary";
  patterns: Array<string | RegExp>;
}

// ── Category 1 — Overused Transitions (weight: 15, expected: 0.8/100 words) ──
// Detected when they appear as sentence starters or after comma/semicolon.
export const TRANSITIONS: PatternCategory = {
  name: "Transitional Phrases",
  weight: 15,
  expected: 0.8,
  matchMode: "phrase",
  patterns: [
    "moreover",
    "furthermore",
    "additionally",
    "nevertheless",
    "consequently",
    "in addition",
    "similarly",
    "conversely",
    "notably",
    "specifically",
    "it is worth noting",
    "that being said",
    "having said that",
    "in light of this",
    "with that in mind",
    "on the other hand",
    "in conclusion",
    "to summarize",
    "to summarise",
    "in summary",
    "first and foremost",
    "last but not least",
    "in other words",
    "as a result",
    "for instance",
    "for example",
  ],
};

// ── Category 2 — AI Clichés (weight: 25, expected: 0.3/100 words) ──
// Partial phrase matches anywhere within a sentence.
export const CLICHES: PatternCategory = {
  name: "AI Clichés",
  weight: 25,
  expected: 0.3,
  matchMode: "phrase",
  patterns: [
    "in today's rapidly evolving",
    "in today's fast-paced",
    "in today's ever-changing",
    "in today's world",
    "let's dive deep",
    "let's dive in",
    "let's unpack",
    "unlock your potential",
    "unlock the potential",
    "unlock its potential",
    "harness the power of",
    "at the end of the day",
    "game-changer",
    "game changer",
    "it's not just about",
    "the landscape of",
    "a testament to",
    "the realm of",
    "delve into",
    "delves into",
    "navigate the complexities",
    "navigating the complexities",
    "elevate your",
    "empower you",
    "empower your",
    "empower teams",
    "empower individuals",
    "foster innovation",
    "foster collaboration",
    "foster growth",
    "paradigm shift",
    "embark on a journey",
    "embark on this journey",
    "embark on your journey",
    "rich tapestry",
    "nuanced understanding",
    "holistic approach",
    "transformative journey",
    "thought leader",
    "disruptive innovation",
    "digital transformation",
    "level up",
    "in the age of",
    "ever-evolving landscape",
    "rapidly changing landscape",
    "changing landscape",
    "revolutionize the way",
    "revolutionise the way",
    "step-by-step guide",
    "the world of",
    "unlocking the",
    "the power of",
    "seamlessly integrate",
    "seamlessly",
  ],
};

// ── Category 3 — Hedging Language (weight: 15, expected: 0.6/100 words) ──
export const HEDGING: PatternCategory = {
  name: "Hedging Language",
  weight: 15,
  expected: 0.6,
  matchMode: "phrase",
  patterns: [
    "it's important to note",
    "it is important to note",
    "it's worth mentioning",
    "it is worth mentioning",
    "it should be noted",
    "it's worth noting",
    "it is worth noting",
    "one might argue",
    "it could be said",
    "it could be argued",
    "arguably",
    "to some extent",
    "in some ways",
    "a wide range of",
    "a variety of",
    "various",
    "numerous",
    "significant",
    "substantial",
    "plays a crucial role",
    "plays a vital role",
    "plays a key role",
    "plays a pivotal role",
    "plays an important role",
    "it's important to understand",
    "it is important to understand",
    "generally speaking",
    "in general",
    "often times",
    "oftentimes",
    "in many cases",
    "in most cases",
    "can be seen as",
    "may be considered",
    "might be considered",
  ],
};

// ── Category 4 — Corporate Buzzwords (weight: 20, expected: 0.5/100 words) ──
export const BUZZWORDS: PatternCategory = {
  name: "Corporate Buzzwords",
  weight: 20,
  expected: 0.5,
  matchMode: "word-boundary",
  patterns: [
    "utilize",
    "utilise",
    "facilitate",
    "optimize",
    "optimise",
    "leverage",
    "synergize",
    "synergise",
    "synergy",
    "streamline",
    "spearhead",
    "operationalize",
    "operationalise",
    "incentivize",
    "incentivise",
    "best-in-class",
    "cutting-edge",
    "state-of-the-art",
    "robust",
    "scalable",
    "ecosystem",
    "alignment",
    "stakeholder",
    "value proposition",
    "low-hanging fruit",
    "circle back",
    "bandwidth",
    "actionable",
    "actionable insights",
    "key takeaways",
    "best practices",
    "pain points",
    "touch base",
    "take it offline",
    "on the same page",
    "think outside the box",
    "innovative solution",
    "innovative approach",
    "impactful",
    "scalability",
    "deliverables",
    "synergistic",
    "proactive",
    "strategic",
    "move the needle",
    "deep dive",
  ],
};

// ── Category 5 — Robotic Structural Patterns (weight: 25, expected: 0.4/100 words) ──
// Regex-based: detect structural patterns, not just phrases.
export const STRUCTURE: PatternCategory = {
  name: "Robotic Structure",
  weight: 25,
  expected: 0.4,
  matchMode: "regex",
  patterns: [
    // Rhetorical question immediately followed by an answer sentence
    /\b[A-Z][^.!?]*\?\s+[A-Z][^.!?]*\./g,

    // Announcement of emphasis / formulaic intros
    /\b(let me be clear|here's the thing|here is the thing|the key takeaway is|the bottom line is|the truth is|the reality is|make no mistake|the fact is|the good news is|the bad news is)\b/gi,

    // Formulaic paragraph openers: First/Second/Third or One/Another/Finally
    /^(first|second|third|fourth|fifth|one|another|finally|additionally|lastly)[,.:]/gim,

    // Numbered list in prose
    /there (are|were|have been) (one|two|three|four|five|six|seven|eight|nine|ten|\d+) (key |main |important |primary |core )?(factors|reasons|ways|steps|things|points|aspects|elements|principles|benefits|challenges|tips)/gi,

    // "X, Y, and Z" triple structure — exactly 3 parallel items (appears 2+ times = structural habit)
    /\b\w+(?:\s+\w+){0,3},\s+\w+(?:\s+\w+){0,3},?\s+and\s+\w+(?:\s+\w+){0,3}\b/gi,

    // Excessive dramatic colons: "And here's what I found:" type constructions
    /\b(and here[''']?s|here[''']?s what|what this means|what that means|what you need to know|the answer is|the result is|the secret is|the solution is)\b[^.!?]*:/gi,

    // "In this [article/post/guide/piece], we will/I will..."
    /\bin this (article|post|guide|piece|blog post|essay|write-up),?\s+(we will|i will|we'll|i'll|you will|you'll)/gi,

    // Closing summary tells: "In conclusion", "To wrap up", "In summary", "To sum up"
    /^(in conclusion|to conclude|to wrap (up|things up)|in summary|to sum up|all in all|as we (have seen|can see)|when all is said and done)/gim,
  ],
};

export const ALL_CATEGORIES: PatternCategory[] = [
  TRANSITIONS,
  CLICHES,
  HEDGING,
  BUZZWORDS,
  STRUCTURE,
];
