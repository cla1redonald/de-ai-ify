# de-ai-ify

[![Live Demo](https://img.shields.io/badge/demo-de--ai--ify.vercel.app-black?style=flat-square)](https://de-ai-ify.vercel.app)
[![Tests](https://img.shields.io/badge/tests-188%20passing-brightgreen?style=flat-square)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**No more mush.**

Score any text for AI writing patterns — overused clichés, hedging language, robotic structure, flat rhythm, repetitive vocabulary. Not an authorship detector. A quality scorer.

Paste a URL or text, get an instant score (0–100), see exactly which patterns fired, and optionally rewrite the flagged sections with Claude.

## Try it

→ **[de-ai-ify.vercel.app](https://de-ai-ify.vercel.app)** — paste any text or URL and get an instant score.

---

## How it works

### Scoring engine

Scoring is **100% client-side** — pure TypeScript, no API calls, no latency, no cost. The engine analyses text across **11 categories** in two layers:

#### Pattern matching (6 categories, 76% weight)

| Category | What it catches |
|---|---|
| **Transitional Phrases** | moreover, furthermore, in conclusion, by extension... |
| **AI Clichés** | delve into, navigate the complexities, paradigm shift, at its core, shaping the future... |
| **Hedging Language** | it's important to note, one might argue, cannot be overstated, challenges and opportunities... |
| **Corporate Buzzwords** | leverage, synergize, streamline, actionable insights, thought leadership... |
| **Robotic Structure** | rhetorical Q&A, formulaic three-point lists, "while X, it also Y" balanced viewpoints, emoji bullets... |
| **Connective Tissue** | "This means...", "This ensures...", "These factors..." — AI's primary glue between ideas |

Buzzwords have **context-aware matching** — "leverage a crowbar" won't score, but "leverage synergies" will. Five high-false-positive terms (leverage, ecosystem, bandwidth, alignment, robust) check the surrounding sentence for legitimate technical/physical usage before counting.

#### Statistical analysis (5 categories, 24% weight)

| Category | Signal | How it works |
|---|---|---|
| **Sentence Rhythm** | Uniform sentence lengths | Coefficient of variation of word counts per sentence. Humans mix 4-word punches with 30-word run-ons. AI stays eerily uniform. |
| **Vocabulary Richness** | Word reuse | Moving-Average Type-Token Ratio across 50-word sliding windows. AI cycles through the same vocabulary. |
| **Paragraph Burstiness** | Flat information density | CV of paragraph lengths. Humans write in bursts (dense paragraph → short quip → long narrative). AI maintains flat register. |
| **Paragraph Openings** | Repetitive starts | Shannon entropy of syntactic-bucket classification (pronoun/article/transition/gerund/other). Low entropy = repetitive = AI tell. |
| **Punctuation Diversity** | No semicolons, dashes, or parentheticals | Ratio of "rich" punctuation to total. AI almost exclusively uses periods and commas. |

Each category score is normalised using a **sigmoid density curve** — matches per hundred words mapped against a baseline for normal prose. This prevents short texts from being penalised unfairly for a single match. The final score is a weighted sum, 0–100.

### Score tiers

| Score | Grade | Meaning |
|---|---|---|
| 0–30 | **Human** | Reads like a person wrote it |
| 31–69 | **Mixed** | Some AI patterns showing through |
| 70–100 | **Slop** | Textbook AI-generated prose |

### Rewrites

Flagged text can be rewritten by Claude (Sonnet 4.6). The rewrite is aggressive: it restructures sentences, varies rhythm, cuts filler, and injects genuine human texture. A **word-level diff view** highlights exactly what changed (green = added, red = removed), with a "Clean" tab for side-by-side comparison. Rate-limited to 3/day per IP.

### URL scraping

Paste a URL instead of text. Firecrawl fetches the article content, strips markdown, and feeds it to the scoring engine.

### API

Score text programmatically:

```bash
curl -X POST https://de-ai-ify.vercel.app/api/score \
  -H "Content-Type: application/json" \
  -d '{"text": "Moreover, it is important to note that leveraging synergies..."}'
```

Returns:
```json
{
  "score": 82,
  "grade": "slop",
  "verdictCopy": "Almost every marker is firing...",
  "patterns": [...],
  "wordCount": 45
}
```

You can also pass `{"url": "https://..."}` to score a web page directly.

---

## Getting started

```bash
git clone https://github.com/cla1redonald/de-ai-ify.git
cd de-ai-ify
npm install
```

### Environment variables

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...    # rewrites only
FIRECRAWL_API_KEY=fc-...        # URL scraping only
```

Both are optional. Scoring works without either key.

### Development

```bash
npm run dev       # http://localhost:3000
npm test          # 188 tests (Vitest)
npm run test:watch
```

### Deploy

```bash
npx vercel --prod
```

Add `ANTHROPIC_API_KEY` and `FIRECRAWL_API_KEY` to Vercel environment variables.

---

## Architecture

```
Text Input → calculateScore()
  ├─ Pattern Analysis (6 categories, phrase/regex/word-boundary matching)
  │  └─ Context-aware filtering (exclude legitimate technical usage)
  ├─ Statistical Analysis (5 categories, CV/entropy/TTR)
  ├─ Sigmoid density normalisation per category
  ├─ Weighted sum → score 0–100
  └─ Verdict copy generation (references top pattern + statistical findings)
```

- **Scoring**: client-side TypeScript, zero API cost, ~5ms per analysis
- **Rewrites**: server-side Claude Sonnet 4.6 call with word-level diff, rate-limited
- **Scraping**: server-side Firecrawl with 15s timeout + graceful fallback
- **Diff engine**: LCS-based word-level diff for rewrite change highlighting

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Vitest · Anthropic SDK · Firecrawl

## Contributing

PRs welcome. The scoring engine is in `src/lib/scoring/` — patterns are easy to add.

```bash
git clone https://github.com/cla1redonald/de-ai-ify.git
cd de-ai-ify
npm install
npm test          # run all 188+ tests
npm run dev       # start dev server
```

### Adding patterns

1. Add your pattern to the appropriate category in `src/lib/scoring/patterns.ts`
2. Add a detection test in `src/lib/scoring/__tests__/patterns.test.ts`
3. Run `npm test` to verify no regressions
4. If the pattern has legitimate non-AI uses, add it as a `contextualPattern` with `excludeContexts`

## License

MIT
