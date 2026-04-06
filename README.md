# de-ai-ify

**No more mush.**

Paste a URL or a block of text and get a score for how much it reads like AI-generated prose. Five pattern categories, instant client-side analysis, no API calls for scoring. When the text is bad enough to fix, Claude rewrites it.

---

## How it works

### Scoring

Scoring runs entirely in the browser — no network requests, no latency.

The engine scans text across five categories:

| Category | What it catches |
|---|---|
| **Transitional Phrases** | moreover, furthermore, in conclusion, first and foremost, last but not least... |
| **AI Clichés** | delve into, navigate the complexities, game-changer, paradigm shift, harness the power of... |
| **Hedging Language** | it's important to note, it's worth mentioning, one might argue, plays a crucial role... |
| **Corporate Buzzwords** | utilize, leverage, facilitate, synergize, streamline, actionable insights... |
| **Robotic Structure** | rhetorical questions answered immediately, formulaic three-point lists, templated paragraph openings... |

Each category is scored using a sigmoid density curve — matches per hundred words mapped against a baseline for normal prose. This prevents short texts from being penalised unfairly for a single match. Categories carry different weights; the final score is a weighted sum, 0–100.

**Score tiers:**

- **0–30** — Human
- **31–69** — Mixed
- **70–100** — Slop

### Rewrites

Flagged text can be rewritten by Claude (claude-sonnet-4). The model is instructed to remove AI patterns while preserving meaning, register, and length. Rewrites are rate-limited to **3 per day** per IP address on the free tier, enforced server-side.

### URL scraping

Paste a URL instead of text and the scrape endpoint fetches the article content via Firecrawl, then scores it.

---

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (rewrites only)
- A [Firecrawl API key](https://firecrawl.dev/) (URL scraping only)

Scoring works without either key. You only need them if you want rewrites and URL scraping.

### Install

```bash
git clone https://github.com/your-org/de-ai-ify.git
cd de-ai-ify
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...
```

Both are optional for local development if you only want to test scoring.

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test
```

163 tests covering the scoring engine, pattern matching, and sample texts. Uses Vitest.

To run in watch mode:

```bash
npm run test:watch
```

---

## Deployment

The app deploys to Vercel with zero configuration.

```bash
npx vercel --prod
```

Add `ANTHROPIC_API_KEY` and `FIRECRAWL_API_KEY` to your Vercel project environment variables. Scoring works without them; rewrites and URL scraping will return errors until they are set.

---

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Vitest** — test runner
- **Anthropic SDK** — rewrites via Claude
- **Firecrawl** — URL content extraction

---

## License

MIT
