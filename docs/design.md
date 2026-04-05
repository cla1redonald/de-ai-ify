# De-ai-ify — UI/UX Design Spec

**Status:** v1.0 — Ready for engineering  
**Date:** 2026-04-05  
**Audience:** @engineer (Next.js / Tailwind / shadcn/ui)

---

## 1. Design Philosophy

De-ai-ify has a point of view. It is not a neutral productivity tool. It is a sharp editorial voice that calls out mush with confidence and mild irreverence.

**Reference points:**
- Hemingway Editor — clarity-first, the text is the UI
- A newspaper's copy desk — direct, unsentimental, no padding
- A redline in a manuscript — surgical, specific, never vague

**Principles:**

1. **Personality without clutter.** The tool has wit in its copy and colour. It does not have decorations, gradients, or marketing chrome.
2. **The score is the product.** Everything on the results screen exists to serve comprehension of the score. Nothing competes with it.
3. **Dark mode is the default and the only mode.** This is not a toggle. Dark backgrounds make the colour-coded score pop and reinforce the editorial aesthetic.
4. **Copy does the heavy lifting.** Taglines, error messages, button labels — all should sound like a sharp human wrote them. No "Submit", no "Process text", no "Please wait."
5. **Not corporate.** No rounded-3xl cards, no gradient heroes, no testimonials. Flat, direct, monospaced where appropriate.

**Tone of voice in UI copy:**
- Tagline options: "No more mush." / "Call it what it is." / "Your text, honestly reviewed."
- Score reveal: "Here's the damage." / "Verdict:"
- Clean result: "Actually pretty good." / "Your human shows."
- High slop result: "Yikes." / "This reads like a Tuesday morning prompt."
- Error on URL scrape: "Couldn't fetch that one. Paste the text instead."
- Rewrite button label: "Clean it up"
- Copy button: "Copied" (not "Copy to clipboard")

---

## 2. Colour Palette

Dark editorial — ink, not shadow.

```
Background:     #0E0E0E   (near-black, not pure black — softer on eyes)
Surface:        #1A1A1A   (cards, panels, input backgrounds)
Surface raised: #242424   (hover states, active tabs)
Border:         #2E2E2E   (subtle separators)

Text primary:   #F0EDE8   (warm off-white — not stark #FFFFFF)
Text secondary: #8A8480   (muted, labels, metadata)
Text tertiary:  #5A5754   (placeholders, disabled)

Accent:         #E8C547   (a sharp mustard/gold — editorial, not corporate yellow)
Accent hover:   #D4B03E

Score: green    #3DBA74   (human — confident, not lime)
Score: amber    #E8923A   (mixed — editorial orange)
Score: red      #E84E3A   (slop — sharp red, not alarm red)

Mono text:      #C5C0BA   (slightly warm, easy to read on dark)
Highlight bg:   rgba(232, 197, 71, 0.18)  (offending phrase highlight — accent at 18% opacity)
```

Tailwind custom colours to define in `tailwind.config.ts`:
```
'bg-base': '#0E0E0E'
'bg-surface': '#1A1A1A'
'bg-raised': '#242424'
'border-subtle': '#2E2E2E'
'text-primary': '#F0EDE8'
'text-secondary': '#8A8480'
'text-tertiary': '#5A5754'
'accent': '#E8C547'
'score-green': '#3DBA74'
'score-amber': '#E8923A'
'score-red': '#E84E3A'
```

---

## 3. Typography

**Fonts:**
- **UI / headings:** `Inter` — weight 400/500/600. Clean, editorial, neutral. Not humanist, not geometric — exactly between.
- **Scored / analyzed text:** `JetBrains Mono` or `IBM Plex Mono` — monospaced text makes the copy feel like a manuscript under review. Used for the pasted text display and any highlighted output.
- **Score number:** `Inter` at `font-black` (900 weight), tabular-nums. The number needs to be unambiguous at a glance.

Google Fonts import:
```
Inter: 400, 500, 600, 900
JetBrains Mono: 400, 500
```

**Type scale (Tailwind):**

| Element | Class | Notes |
|---|---|---|
| Score number | `text-8xl font-black tabular-nums` | 6rem on mobile, 8rem+ on desktop |
| Score label ("Slop Score") | `text-sm font-medium tracking-widest uppercase` | All caps, wide tracking |
| H1 / tagline | `text-3xl font-semibold` | One line only |
| Body / UI labels | `text-sm` or `text-base` | `text-sm` for dense info |
| Input text | `font-mono text-sm` | JetBrains Mono |
| Analyzed text | `font-mono text-sm leading-relaxed` | More line-height for readability |
| Pattern category | `text-xs font-medium tracking-wide uppercase` | Category badges |
| Button | `text-sm font-semibold tracking-wide` | Slightly tracked |

---

## 4. Layout — Single Page, Three States

The app lives on one URL. No navigation. State transitions are animated in-place.

### Global shell

```
max-w-2xl mx-auto px-4 py-12
```

No sidebar. No nav bar. Just a minimal header: logo + wordmark left-aligned, nothing right. On mobile the header collapses to wordmark only.

**Header:**
```
Logo: a small red/amber strikethrough mark (X through a word, or an editorial delete mark)
Wordmark: "de-ai-ify" in Inter 600, text-primary
Subline (optional): "AI Slop Score" in text-tertiary text-xs
```

---

### State 1 — Input

**Purpose:** User arrives, pastes URL or text, hits score.

**Layout:**

```
[Header]

[Tagline — one punchy line]

[Tab bar: "Paste URL" | "Paste Text"]

[Input area — conditional on tab]

[Score it button — full width on mobile, wide on desktop]

[3-line explainer beneath button — what this is, what it isn't]
```

**Tab bar:** Two tabs, minimal underline style (not pill/box style). Active tab: `text-accent border-b-2 border-accent`. Inactive: `text-secondary`.

**URL input:**
```
Placeholder: "https://linkedin.com/posts/..."
Type: url, full width
On submit attempt: show inline validation ("That doesn't look like a URL")
```

**Text area:**
```
Placeholder: "Paste the text you want to score..."
Min-height: 200px on desktop, 160px on mobile
Font: font-mono text-sm
Character count: bottom-right, text-tertiary, appears after 50 chars
```

**Score it button:**
```
bg-accent text-bg-base font-semibold
Full width: w-full on mobile, max-w-xs centered on desktop? No — full width everywhere, it's simpler.
Height: h-12 (48px) — comfortable touch target
Loading state: spinner replaces label text, button stays same size (no layout shift)
Label: "Score it"
```

**Beneath button — disclaimer copy:**
```
text-xs text-tertiary text-center max-w-sm mx-auto
"Scores writing quality, not authorship. High scores mean mush, not AI."
```

---

### State 2 — Results

**Purpose:** Show the score with impact. Let user explore the breakdown. Offer the rewrite path.

**Layout:**

```
[Back link — "← Score something else"]

[Score hero block]

[Verdict copy — 1-2 lines]

[Pattern breakdown]

[Original text with highlights]

[Rewrite button — if patterns found]
```

**Score hero block:**

The score is the hero. It deserves space and drama.

```
Centred block:

  SLOP SCORE          ← text-xs tracking-widest uppercase text-secondary
  
       74             ← text-8xl font-black, colour-coded
  
  ████████░░          ← thin progress bar, colour-coded, animated in on load
  
  MIXED               ← grade label: HUMAN / MIXED / SLOP — text-sm uppercase tracking-widest
```

Score colouring logic:
- 0–30: `text-score-green` — "HUMAN"
- 31–69: `text-score-amber` — "MIXED"  
- 70–100: `text-score-red` — "SLOP"

Animation: Score counts up from 0 to final value over 800ms on initial reveal, easing out. Progress bar fills simultaneously. This is the money moment — it should feel satisfying. Use a counter animation (CSS custom property or JS requestAnimationFrame).

Progress bar: `h-1.5 rounded-full bg-border-subtle`, filled portion uses score colour. No third-party gauge needed — a simple bar is cleaner and faster to read.

**Verdict copy:**

One or two lines of copy that reads the score contextually. Examples:
- 74: "Heavy reliance on transitional phrases and hedging language. The structure is there — the voice isn't."
- 12: "Reads like a person wrote it. Some filler, nothing egregious."
- 91: "Almost every paragraph opens with a transitional phrase. Strong presence of power-word padding."

This copy comes from the scoring engine but should be surfaced with editorial weight: `text-base text-primary font-medium` with a subtle left border accent: `border-l-2 border-accent pl-3`.

**Pattern breakdown:**

A list of detected pattern categories with counts and severity.

```
[Pattern Category Row]
  ├── Category name badge (e.g. "Transitional Phrases")
  ├── Count pill ("7 instances")
  ├── Severity indicator (dot: green/amber/red)
  └── Expand chevron →
      └── [Expanded: list the actual phrases found, each linkable to highlight in text]
```

Category badge style: `bg-bg-raised text-text-secondary text-xs font-medium px-2 py-0.5 rounded`

Count pill: `bg-score-red/20 text-score-red text-xs px-2 py-0.5 rounded-full` (colour matches severity)

Expand/collapse: smooth `max-h` transition, 200ms. Expanded section shows the actual flagged phrases in `font-mono text-xs` with their surrounding context (15 words either side).

Categories to support (from scoring engine spec):
1. Transitional Phrases ("furthermore", "moreover", "in conclusion")
2. Hedge Words ("leverage", "ecosystem", "synergy", "robust")
3. Power Padding ("game-changing", "revolutionary", "cutting-edge")
4. Robotic Structure (every paragraph starts with a topic sentence + 3 supporting points + conclusion)
5. AI Clichés ("delve", "nuanced", "it's important to note", "in today's world")
6. Excessive Hedging ("it could be argued", "one might say", "it's worth noting")

**Highlighted text panel:**

Below the pattern breakdown: the original text rendered in `font-mono text-sm leading-relaxed` with offending phrases highlighted in-line using `bg-highlight rounded-sm px-0.5` (the 18% accent yellow defined above). Hovering a highlight shows a small tooltip: the category name.

On mobile: this panel collapses by default ("Show highlighted text ↓") to avoid overwhelming the screen.

**Rewrite button:**

```
variant: outline — border-accent text-accent hover:bg-accent hover:text-bg-base
label: "Clean it up"
w-full on mobile
3/day limit shown beneath: "3 rewrites remaining today" in text-tertiary text-xs
```

---

### State 3 — Rewrite

**Purpose:** Show original vs rewritten text. Let user copy the rewrite.

**Layout:**

On desktop: two columns side by side (`grid grid-cols-2 gap-6`).  
On mobile: stacked, with "Original" collapsed by default (user wants the output, not the input they already know).

```
[← Back to results]

Desktop:
┌─────────────────────┐  ┌─────────────────────┐
│ ORIGINAL            │  │ REWRITTEN           │
│                     │  │                     │
│ [original text,     │  │ [rewritten text,    │
│  muted, mono]       │  │  brighter, mono]    │
│                     │  │ [Copy button]       │
└─────────────────────┘  └─────────────────────┘

Mobile:
[Rewritten — full width, bright]
[Copy button — full width]
[Show original ↓] — collapsed by default
```

Original panel: `text-text-tertiary` — intentionally muted, it's the "before".  
Rewritten panel: `text-text-primary` — the thing they want.

Both panels: `bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed`

**Copy button:**

```
bg-accent text-bg-base font-semibold h-10 w-full
On click: label changes to "Copied" for 2 seconds, then reverts.
Micro-interaction: brief scale-95 on click (active:scale-95 transition-transform)
```

**Re-score note:** Beneath the rewrite, in `text-tertiary text-xs`: "Want to check the rewrite? Paste it in."  
Link back to input — no auto-resubmit, that would be weird.

---

## 5. Score Visualisation — Decision

**Chosen approach: Large number + thin progress bar + grade label.**

Rationale:
- Large number is instantly readable and screenshot-worthy (social sharing potential)
- Progress bar adds visual context without being a busy gauge
- Grade label (HUMAN / MIXED / SLOP) is the human-readable verdict — no number interpretation required
- A-F letter grades were considered and rejected: they feel academic, not editorial
- Circular gauge rejected: too dashboard-y, competes with score number

The number IS the shareable moment. At 8xl / font-black, a "91" in `text-score-red` fills the viewport on mobile. That's intentional.

---

## 6. Micro-interactions

| Interaction | Behaviour | Implementation |
|---|---|---|
| Score reveal | Count up from 0 to score over 800ms, ease-out | `requestAnimationFrame` counter or `animate-[count]` |
| Progress bar fill | Simultaneous with score count, `transition-[width]` | CSS transition on width, triggered on mount |
| Tab switch | Input area cross-fades, no layout jump | `opacity-0 → opacity-100`, absolute positioned during transition |
| Pattern expand | Max-height transition | `max-h-0 → max-h-96 overflow-hidden transition-all duration-200` |
| Phrase highlight hover | Tooltip appears above phrase | Tailwind `group/peer` or simple `title` attr for MVP |
| Copy button | Label swap + brief scale | `useState` + `transition-transform active:scale-95` |
| Score it loading | Button label swaps to spinner, no layout shift | Replace text with `<Spinner />` of same height |
| URL scrape fail | Inline error, tab auto-switches to "Paste Text" | `setError` + `setActiveTab('text')` + toast |

**No skeleton loaders** for the results state. Show a full-screen loading state with just the score label: "Scoring..." in `text-secondary text-sm text-center` at the centre of the layout. Simple, not skeletonised — the layout change on reveal is part of the moment.

---

## 7. Responsive Breakpoints

Mobile-first. The primary use case on mobile is paste-text (not URL — too fiddly to copy URLs on mobile).

| Breakpoint | Tailwind | Key changes |
|---|---|---|
| Default (mobile) | — | Full-width inputs, stacked layout, text area 160px min, score at `text-7xl`, rewrite stacked |
| sm: 640px | `sm:` | Minor spacing adjustments |
| md: 768px | `md:` | Score at `text-8xl`, highlighted text panel visible by default |
| lg: 1024px | `lg:` | Rewrite splits to two columns, max-w-2xl container stays centred |

Mobile-specific:
- Paste text tab is the **default active tab** on mobile (detect via screen width or user-agent hint — prefer screen width `window.innerWidth < 640`)
- Character count always visible on mobile (not hover-triggered)
- Highlighted text panel collapsed with "Show annotated text" disclosure, to avoid a wall of text between pattern list and rewrite button
- Touch targets: all interactive elements `min-h-[44px]`

---

## 8. Accessibility Baseline

- All interactive elements keyboard-focusable with visible `:focus-visible` ring: `outline-2 outline-offset-2 outline-accent`
- Tab switching uses ARIA roles: `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`
- Score number has `aria-label="Slop score: 74 out of 100"` — do not rely on visual colour alone
- Score grade label also conveyed in aria: `aria-label="Grade: Mixed"` 
- Progress bar: `role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}`
- Highlighted phrases: `<mark>` element with `title` attribute for tooltip — `<mark>` has semantic meaning for highlighted/annotated text
- Colour is never the sole signal — score label, grade text, and count numbers all reinforce colour meaning
- Contrast ratios:
  - `text-primary` on `bg-base`: #F0EDE8 on #0E0E0E = ~17:1 (AAA)
  - `text-secondary` on `bg-base`: #8A8480 on #0E0E0E = ~5.1:1 (AA)
  - `text-score-red` on `bg-base`: #E84E3A on #0E0E0E = ~4.8:1 (AA)
  - `accent` on `bg-base`: #E8C547 on #0E0E0E = ~10.2:1 (AAA)
  - `bg-base text` on `accent` button: #0E0E0E on #E8C547 = ~10.2:1 (AAA)

---

## 9. Component List

All components are React functional components. Props typed with TypeScript interfaces. Tailwind for all styling — no CSS modules, no styled-components.

---

### `<App />`
Root component. Owns top-level state machine.

```ts
type AppState = 'input' | 'results' | 'rewrite'

state: {
  appState: AppState
  input: { mode: 'url' | 'text', value: string }
  scoreResult: ScoreResult | null
  rewriteResult: string | null
}
```

---

### `<Header />`
```ts
// No props — static
```
Logo mark + "de-ai-ify" wordmark. Minimal. No nav.

---

### `<InputPanel />`
```ts
props: {
  onScore: (result: ScoreResult) => void
}

state: {
  activeTab: 'url' | 'text'
  urlValue: string
  textValue: string
  isLoading: boolean
  error: string | null
}
```

Renders `<TabBar />`, `<UrlInput />` or `<TextInput />` conditionally, `<ScoreButton />`, disclaimer copy.

---

### `<TabBar />`
```ts
props: {
  active: 'url' | 'text'
  onChange: (tab: 'url' | 'text') => void
}
```
Two tabs. Underline active indicator. ARIA tablist pattern.

---

### `<UrlInput />`
```ts
props: {
  value: string
  onChange: (val: string) => void
  error: string | null
}
```
Type=url input. Inline error display beneath. Full width.

---

### `<TextInput />`
```ts
props: {
  value: string
  onChange: (val: string) => void
  charCount: number
}
```
Textarea. Min-height via CSS. Char count bottom-right. Font-mono.

---

### `<ScoreButton />`
```ts
props: {
  isLoading: boolean
  onClick: () => void
  disabled: boolean
}
```
Full-width. Loading state replaces text with `<Spinner />`.

---

### `<Spinner />`
```ts
props: {
  size?: 'sm' | 'md'  // default: 'md'
}
```
Simple CSS `animate-spin` border spinner. No library dependency.

---

### `<ResultsPanel />`
```ts
props: {
  result: ScoreResult
  onRewrite: () => void
  onReset: () => void
  rewritesRemaining: number
}
```
Renders `<ScoreHero />`, `<VerdictCopy />`, `<PatternBreakdown />`, `<AnnotatedText />`, `<RewriteButton />`.

---

### `<ScoreHero />`
```ts
props: {
  score: number          // 0–100
  animateIn: boolean     // trigger count-up on true
}
```
Score number (colour-coded), progress bar, grade label. Count-up animation on mount.

---

### `<ProgressBar />`
```ts
props: {
  value: number    // 0–100
  color: 'green' | 'amber' | 'red'
  animate: boolean
}
```
`h-1.5 rounded-full`. Fills from 0 to `value` on mount if `animate=true`.

---

### `<VerdictCopy />`
```ts
props: {
  text: string
}
```
One or two lines from the scoring engine. Left border accent styling.

---

### `<PatternBreakdown />`
```ts
props: {
  patterns: PatternResult[]
}
```
Renders a `<PatternRow />` for each detected category.

---

### `<PatternRow />`
```ts
props: {
  pattern: PatternResult   // { category, count, severity, instances: string[] }
  defaultOpen?: boolean
}
```
Category badge + count pill + severity dot + expand chevron. Expanded section lists instances in mono font.

---

### `<AnnotatedText />`
```ts
props: {
  text: string
  highlights: HighlightSpan[]  // { start, end, category }
  defaultCollapsed?: boolean    // true on mobile
}
```
Renders text with `<mark>` spans for highlights. Disclosure pattern on mobile.

---

### `<RewriteButton />`
```ts
props: {
  onClick: () => void
  isLoading: boolean
  rewritesRemaining: number   // shows "N rewrites remaining" if < 3
  disabled: boolean
}
```

---

### `<RewritePanel />`
```ts
props: {
  original: string
  rewritten: string
  onBack: () => void
}
```
Two-column on desktop, stacked on mobile. Renders `<TextPane />` × 2 and `<CopyButton />`.

---

### `<TextPane />`
```ts
props: {
  label: string          // "ORIGINAL" | "REWRITTEN"
  text: string
  muted?: boolean        // true for original
}
```
Label, scrollable mono text block.

---

### `<CopyButton />`
```ts
props: {
  text: string           // text to copy
}
state: { copied: boolean }
```
Copies to clipboard on click. Label: "Copy" → "Copied" for 2s. `active:scale-95`.

---

### `<ErrorMessage />`
```ts
props: {
  message: string
  action?: { label: string, onClick: () => void }
}
```
Used for URL scrape failures and other inline errors. `text-score-red text-sm`.

---

### `<Toast />` (optional, MVP-tier)
```ts
props: {
  message: string
  type: 'error' | 'info'
  onDismiss: () => void
}
```
Bottom of viewport on mobile. Can use shadcn/ui `<Toast />` from sonner.

---

## 10. Shared Types

```ts
interface ScoreResult {
  score: number                    // 0–100
  grade: 'human' | 'mixed' | 'slop'
  verdictCopy: string
  patterns: PatternResult[]
  originalText: string
  highlights: HighlightSpan[]
}

interface PatternResult {
  category: string
  count: number
  severity: 'low' | 'medium' | 'high'
  instances: string[]              // the actual flagged phrases with context
}

interface HighlightSpan {
  start: number
  end: number
  category: string
}
```

---

## 11. File Structure (suggested to @engineer)

```
/app
  page.tsx                  // <App /> root
  layout.tsx                // font imports, dark bg
  globals.css               // base styles, scrollbar, selection colour

/components
  /input
    InputPanel.tsx
    TabBar.tsx
    UrlInput.tsx
    TextInput.tsx
    ScoreButton.tsx

  /results
    ResultsPanel.tsx
    ScoreHero.tsx
    ProgressBar.tsx
    VerdictCopy.tsx
    PatternBreakdown.tsx
    PatternRow.tsx
    AnnotatedText.tsx
    RewriteButton.tsx

  /rewrite
    RewritePanel.tsx
    TextPane.tsx
    CopyButton.tsx

  /ui
    Header.tsx
    Spinner.tsx
    ErrorMessage.tsx
    Toast.tsx

/lib
  scorer.ts                 // client-side scoring engine
  types.ts                  // shared TypeScript interfaces
```

---

## 12. globals.css — Base Styles to Set

```css
/* Selection colour — editorial gold */
::selection {
  background-color: rgba(232, 197, 71, 0.3);
  color: #F0EDE8;
}

/* Custom scrollbar — subtle, not garish */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1A1A1A; }
::-webkit-scrollbar-thumb { background: #2E2E2E; border-radius: 3px; }

/* Focus ring — accent colour, visible but not ugly */
:focus-visible {
  outline: 2px solid #E8C547;
  outline-offset: 2px;
}
```

Body: `bg-[#0E0E0E] text-[#F0EDE8] font-sans antialiased`

---

## Exit Checklist

- [x] Design philosophy documented
- [x] Complete colour palette with hex values and Tailwind token names
- [x] Typography scale — fonts, weights, sizes per element
- [x] All three app states fully specced
- [x] Score visualisation approach chosen with rationale
- [x] Pattern breakdown interaction designed
- [x] Rewrite state layout for desktop and mobile
- [x] Micro-interactions listed with implementation approach
- [x] Mobile-first responsive behaviour documented
- [x] Accessibility baseline: contrast ratios, ARIA patterns, keyboard nav
- [x] Complete component list with TypeScript props
- [x] Shared types defined
- [x] Suggested file structure for @engineer
