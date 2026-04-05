# De-ai-ify: Architecture

## System Overview

Single-page Next.js App Router application deployed on Vercel. Two runtime layers:

- **Client-side scoring engine** -- TypeScript module, zero API cost, runs in the browser. Handles all pattern detection and score calculation.
- **Server-side API routes** -- Two thin endpoints: URL scraping (Firecrawl) and text rewriting (Claude Sonnet). Both behind rate limiting.

No database. No auth. State is ephemeral (current session only). Rate limiting uses IP + localStorage fingerprint.

```
+------------------+      +-------------------+      +------------------+
|   Browser        |      |   Vercel Edge     |      |   External APIs  |
|                  |      |                   |      |                  |
|  Scoring Engine  |      |  POST /api/scrape |----->|  Firecrawl       |
|  (client-side)   |      |  POST /api/rewrite|----->|  Claude Sonnet   |
|                  |      |  (rate limited)   |      |                  |
+------------------+      +-------------------+      +------------------+
```

---

## Scoring Engine Design

The scoring engine is a pure TypeScript module (`lib/scoring/`). No network calls. Importable by both client components and server code if needed later.

### Pattern Categories

Each category has a list of patterns (strings or regexes) and a weight that determines its contribution to the final score.

#### 1. Overused Transitions (weight: 15)

Exact word/phrase matches (case-insensitive, must be sentence starters or preceded by comma/semicolon):

```
Moreover, Furthermore, Additionally, Nevertheless, Consequently,
In addition, Similarly, Conversely, Notably, Specifically,
It is worth noting, That being said, Having said that,
In light of this, With that in mind
```

Scoring: count occurrences, normalise by paragraph count. A text with "Moreover" once in 20 paragraphs is fine. "Moreover" 8 times in 5 paragraphs is not.

#### 2. AI Cliches (weight: 25)

Phrase matches (case-insensitive, partial match within sentence):

```
"in today's [fast-paced/rapidly evolving/ever-changing] world"
"let's [dive deep/dive in/unpack]"
"unlock [your/the/its] potential"
"harness the power of"
"at the end of the day"
"game-changer"
"it's not just about X, it's about Y"
"the landscape of"
"a testament to"
"the realm of"
"delve into"
"navigate the complexities"
"elevate your"
"empower [you/your/teams/individuals]"
"foster [innovation/collaboration/growth]"
"paradigm shift"
"embark on [a/this/your] journey"
"rich tapestry"
"nuanced understanding"
"holistic approach"
```

Scoring: each match scores proportionally. One cliche in 500 words is a mild signal. Three in 200 words is heavy.

#### 3. Hedging Language (weight: 15)

```
"it's important to note"
"it's worth mentioning"
"it should be noted"
"one might argue"
"it could be said"
"arguably"
"to some extent"
"in some ways"
"a wide range of"
"a variety of"
"various"  (when used as vague filler, not specific enumeration)
"numerous"
"significant" (when not quantified)
"substantial"
"plays a [crucial/vital/key/pivotal/important] role"
```

#### 4. Corporate Buzzwords (weight: 20)

```
"utilize" / "utilise" (instead of "use")
"facilitate"
"optimize" / "optimise"
"leverage" (as verb)
"synergize" / "synergise"
"streamline"
"spearhead"
"operationalize"
"incentivize"
"best-in-class"
"cutting-edge"
"state-of-the-art"
"robust" (when not describing engineering)
"scalable" (when not about systems)
"ecosystem" (when not about biology)
"align" / "alignment" (when not about design/layout)
"stakeholder"
"value proposition"
"low-hanging fruit"
"circle back"
"move the needle"
"deep dive" (as noun)
```

#### 5. Robotic Structural Patterns (weight: 25)

These are the hardest to detect but the strongest signal. Regex-based:

- **Rhetorical question + immediate answer:** Pattern where a `?` sentence is immediately followed by an answer sentence. Count instances.
- **Triple structure obsession:** Detecting "X, Y, and Z" lists where X/Y/Z are parallel adjective-noun or verb-noun pairs, appearing 3+ times in a text. AI loves exactly three examples.
- **Announcement of emphasis:** "Let me be clear:", "Here's the thing:", "The key takeaway is:", "The bottom line is:"
- **Formulaic paragraph openers:** First words of consecutive paragraphs following a predictable pattern (e.g., "First... Second... Third..." or "One... Another... Finally...").
- **Excessive colons for dramatic effect:** "And here's what I found:" type constructions, 3+ in a short text.
- **Numbered list in prose:** "There are three key factors:" followed by a list. AI defaults to this structure constantly.

### Scoring Algorithm

```typescript
interface CategoryResult {
  category: string;
  weight: number;
  matches: PatternMatch[];   // { pattern, text, position }
  density: number;           // matches per 100 words, 0-1 normalised
}

function calculateScore(text: string): SlopScore {
  const wordCount = countWords(text);
  if (wordCount < 20) return { score: 0, note: "Text too short to score" };

  const categories = [
    analyseTransitions(text, wordCount),
    analyseCliches(text, wordCount),
    analyseHedging(text, wordCount),
    analyseBuzzwords(text, wordCount),
    analyseStructure(text, wordCount),
  ];

  // Each category produces a density score (0-1).
  // Weighted sum, scaled to 0-100.
  const raw = categories.reduce(
    (sum, c) => sum + c.density * c.weight,
    0
  );

  // Max possible raw = sum of all weights = 100.
  // Clamp and round.
  const score = Math.min(100, Math.round(raw));

  return { score, categories };
}
```

**Density calculation per category:**

1. Count pattern matches in the text.
2. Calculate `matchesPerHundredWords = (matchCount / wordCount) * 100`.
3. Map to 0-1 using a sigmoid curve centred on the "expected" frequency. This prevents short texts from being penalised for a single match and long texts from being rewarded for dilution.

```typescript
// density curve: 0 matches = 0, expected = 0.5, 2x expected = ~0.85, 3x+ = ~1.0
function densityCurve(matchesPerHundredWords: number, expected: number): number {
  if (matchesPerHundredWords === 0) return 0;
  const ratio = matchesPerHundredWords / expected;
  return 1 - 1 / (1 + ratio * ratio);
}
```

**Expected frequencies (matches per 100 words) -- tuning values:**

| Category | Expected | Rationale |
|----------|----------|-----------|
| Transitions | 0.8 | ~1 per 125 words is normal prose |
| Cliches | 0.3 | Even one per 300 words is notable |
| Hedging | 0.6 | Some hedging is human; density matters |
| Buzzwords | 0.5 | Context-dependent; business writing naturally has some |
| Structure | 0.4 | Hardest to detect; lower baseline |

**Score interpretation tiers:**

| Score | Label | Colour |
|-------|-------|--------|
| 0-20 | Clean | Green |
| 21-45 | Mild | Yellow |
| 46-70 | Sloppy | Orange |
| 71-100 | Pure Slop | Red |

---

## API Routes

### POST /api/scrape

Accepts a URL, scrapes via Firecrawl, returns plain text.

```typescript
// Request
{ url: string }

// Response 200
{ text: string, title: string, wordCount: number }

// Response 422 -- URL failed to scrape
{ error: "SCRAPE_FAILED", message: string }

// Response 400 -- invalid URL
{ error: "INVALID_URL", message: string }
```

Implementation notes:
- Validate URL format before calling Firecrawl. Reject non-http(s) schemes.
- Firecrawl `scrapeUrl` with `formats: ['markdown']`. Strip markdown syntax to get plain text for scoring.
- Timeout: 15 seconds. If Firecrawl hangs, return SCRAPE_FAILED with message telling user to paste text instead.
- No rate limiting on scrape (Firecrawl has its own limits on their API key).

### POST /api/rewrite

Accepts text, rewrites via Claude Sonnet, returns human-sounding version.

```typescript
// Request
{ text: string }

// Response 200
{ rewritten: string, model: string }

// Response 429 -- rate limited
{ error: "RATE_LIMITED", remaining: 0, resetsAt: string }

// Response 400 -- text too short or too long
{ error: "INVALID_INPUT", message: string }
```

Implementation notes:
- Input limits: min 20 words, max 5000 words.
- Claude Sonnet system prompt emphasises: remove slop patterns, preserve meaning, match the original's register (formal stays formal, casual stays casual), do not add new AI patterns, keep roughly the same length.
- Model: `claude-sonnet-4-20250514` (or latest Sonnet).
- Rate limited: 3 calls per IP per 24h rolling window (see Rate Limiting below).

---

## Data Flow

### Flow 1: Score a URL

```
User enters URL
  -> Client validates URL format
  -> Client calls POST /api/scrape { url }
  -> Server calls Firecrawl, returns { text, title }
  -> Client runs scoringEngine.calculate(text)
  -> Client renders score + pattern breakdown
```

If scrape fails: client shows error with "Paste your text instead" prompt. No retry.

### Flow 2: Score pasted text

```
User pastes text
  -> Client runs scoringEngine.calculate(text) immediately (debounced 300ms)
  -> Client renders score + pattern breakdown
```

No server calls. Instant.

### Flow 3: Rewrite

```
User clicks "Rewrite" button
  -> Client checks localStorage for remaining rewrites
  -> If 0 remaining: show upgrade prompt, stop
  -> Client calls POST /api/rewrite { text }
  -> Server checks IP rate limit
  -> If rate limited: return 429
  -> Server calls Claude Sonnet with text + system prompt
  -> Server returns { rewritten }
  -> Client displays rewritten text alongside original
  -> Client decrements localStorage counter
```

---

## Rate Limiting Strategy

Goal: 3 rewrites per day per user on free tier. No auth, so we approximate identity.

### Server-side (authoritative)

Use Vercel KV (or in-memory Map for MVP) keyed by IP address:

```
Key: ratelimit:{ip}
Value: { count: number, windowStart: number }
```

24-hour rolling window. On each request:
1. Get current record for IP.
2. If `windowStart` is older than 24h, reset to `{ count: 1, windowStart: now }`.
3. If `count >= 3`, return 429 with `resetsAt` timestamp.
4. Otherwise, increment count, proceed.

**MVP simplification:** Use a JavaScript `Map` in the serverless function. This resets on cold starts, which means users occasionally get extra rewrites. Acceptable for MVP -- the goal is soft limiting, not billing enforcement. Upgrade to Vercel KV or Upstash Redis when Pro tier ships.

### Client-side (UX only)

localStorage stores `{ count, windowStart }` to show remaining rewrites in the UI without a server call. This is not authoritative -- just for display. The server is the source of truth.

If localStorage is cleared, the user sees "3 remaining" but the server will still reject if they have exceeded the limit.

---

## Error Handling

| Scenario | User sees | Technical detail |
|----------|-----------|------------------|
| URL scrape fails | "Couldn't read that page. Paste your text instead." + text input auto-focuses | Firecrawl returns error or timeout (15s) |
| URL scrape returns empty | Same as above | Firecrawl succeeded but extracted no meaningful text |
| Rewrite rate limited | "You've used your 3 free rewrites today. Resets at {time}." | 429 from server, show remaining time |
| Rewrite API error | "Rewrite failed. Try again in a moment." + retry button | Claude API 500/timeout. Do not decrement rate limit counter on failure. |
| Text too short | "Paste at least a few sentences for an accurate score." | Client-side check, < 20 words |
| Text too long for rewrite | "Text is too long to rewrite (max ~5000 words). Score is shown below." | Client-side check before API call |
| Invalid URL format | "That doesn't look like a valid URL." | Client-side regex check |

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Server only | Claude API for rewrites |
| `FIRECRAWL_API_KEY` | Server only | Firecrawl API for URL scraping |

Both set in Vercel environment variables. Never exposed to client. No `.env.local` values prefixed with `NEXT_PUBLIC_`.

---

## File Structure

```
de-ai-ify/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Single page: input, score, rewrite
│   ├── globals.css             # Tailwind + custom styles
│   ├── api/
│   │   ├── scrape/
│   │   │   └── route.ts        # POST /api/scrape
│   │   └── rewrite/
│   │       └── route.ts        # POST /api/rewrite
│   └── components/
│       ├── input-form.tsx      # URL + text input tabs
│       ├── score-display.tsx   # Score dial/number + tier label
│       ├── pattern-breakdown.tsx # Category-by-category results
│       ├── rewrite-panel.tsx   # Original vs rewritten side-by-side
│       └── rate-limit-badge.tsx # "3/3 rewrites remaining"
├── lib/
│   ├── scoring/
│   │   ├── engine.ts           # Main calculate() function
│   │   ├── patterns.ts         # All pattern definitions by category
│   │   ├── density.ts          # Density curve + normalisation
│   │   └── types.ts            # SlopScore, CategoryResult, PatternMatch
│   ├── rate-limit.ts           # Server-side rate limiter
│   └── utils.ts                # Word count, text cleaning, URL validation
├── public/
│   └── og-image.png            # Social share image
├── .env.example                # ANTHROPIC_API_KEY, FIRECRAWL_API_KEY
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Complexity Assessment

| Component | Level | Notes |
|-----------|-------|-------|
| Scoring engine | Medium-High | Core IP. Pattern definitions are straightforward but the structural patterns (category 5) require regex work and tuning. Density normalisation needs testing with real text samples. |
| Score display UI | Low | Render a number, a label, a colour. |
| Pattern breakdown UI | Medium | Highlighting matched patterns in the source text requires position tracking. |
| URL scraping endpoint | Low | Thin wrapper around Firecrawl. Error handling is the main work. |
| Rewrite endpoint | Medium | Claude prompt engineering for good rewrites + rate limiting logic. |
| Rate limiting | Low | In-memory Map for MVP. Upgrade path to Redis is clean. |
| Input form (URL + text tabs) | Low | Standard form with tab switching. |

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Client-side scoring, no API | Zero marginal cost at any scale. Instant feedback. Transparent rubric (users can inspect). |
| Rules-based, not ML | Explainable results ("we found 'Moreover' 7 times"). No model drift. No API cost. Can be wrong in known, debuggable ways. |
| In-memory rate limiting for MVP | Cold start resets are acceptable when there is no billing. Avoids adding Redis/KV dependency for launch. |
| Firecrawl for scraping | Handles JS rendering, cookie walls, and common anti-bot measures. Better than cheerio/fetch for real-world URLs. 60% success rate is known and acceptable with paste fallback. |
| No database | Nothing to persist in v1. Score history (v2) will need a database; user_id column should be planned then. |
| Sigmoid density curve | Linear scoring penalises long texts unfairly. Sigmoid compresses extremes -- one match in 2000 words barely registers, but 10 matches in 200 words saturates quickly. |
| Max 5000 words for rewrite | Controls Claude API cost per call. Most articles and posts are under this. |
