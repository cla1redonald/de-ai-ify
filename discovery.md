# De-ai-ify: Discovery

## Brain Dump

**Idea:** A tool that scores any text for "AI slop" — overused AI writing patterns, cliches, robotic structures — and optionally rewrites it to sound more human.

**Origin:** Claire keeps seeing AI-generated mush everywhere (LinkedIn, cover letters, product briefs) and either silently discredits the author or spends too long sanitising her own AI-assisted writing before publishing. Grammarly and Google Gemini do adjacent things but cost too much or are locked to Google Suite. She wants something that works everywhere, is free or very cheap, and serves both reading and writing.

**Two modes:**
- **Reader mode:** Paste a URL, get an AI Slop Score + pattern breakdown. Not "was this written by AI" — "does this read like mush."
- **Writer mode:** Paste your own text, get a score + rewrite in your natural voice.

**Key positioning:** Anti-slop, not anti-AI. Quality scorer, not an authorship detector. No harm in people using AI to generate, as long as the content is meaningful and not just mush.

---

## Discovery

### Desirability

- **Who has this problem:** Anyone in tech, product, or professional settings who reads and writes daily. Content strategists cleaning up team drafts, hiring managers screening cover letters, newsletter writers preserving their voice.
- **Current workarounds:** Manual re-reading, ctrl+F for "delve" and "furthermore", reading aloud, Hemingway Editor (clarity only, not AI patterns), GPTZero (authorship detection, not quality).
- **Pain level:** High for writers (fear of being judged for AI slop delays publishing). Medium for readers (they just silently discredit and move on — no tool helps them articulate why).
- **Switching signal:** People are already building DIY browser extensions (ThatSlop, Slop Evader, SlopBlocker on Chrome Web Store). GitHub repos with AI writing pattern checklists exist. This is real demand, not just complaints.

### Viability

- **Business model:** Freemium. Free: unlimited scoring + 3 rewrites/day. Pro: £9.99/year for unlimited rewrites, score history.
- **Unit economics:** Scoring is client-side (rules-based, zero API cost). Rewrites use Claude Sonnet (~1.2p per rewrite). At £9.99/year, break-even at ~53 rewrites/user/year. Viable.
- **Market size:** AI writing assistant market $4.2B growing to $12B by 2030. AI content detection market $1.8B at 21% CAGR. Adjacent, not identical — de-ai-ify occupies a gap between the two.
- **Competition:** No existing tool combines quality scoring (not authorship detection) + reader mode + writer mode + freemium. Grammarly, GPTZero, Hemingway, Originality.ai all occupy adjacent but different positions.

### Feasibility

- **Stack:** Next.js, Vercel, Claude API (Sonnet for rewrites), Firecrawl (URL scraping)
- **Architecture:** Hybrid — scoring engine runs client-side (TypeScript, pattern matching, zero API cost). Rewrites run server-side (Claude API). URL scraping via Firecrawl with paste-text fallback.
- **URL scraping caveat:** ~60% of URLs will scrape cleanly. LinkedIn, Twitter/X, and Cloudflare-heavy sites will fail. Fallback to paste is essential.
- **Build time:** 2-3 days with Claude Code.

---

## Research Summary

### Round 1: Standard Research

- "Slop" was Merriam-Webster's Word of the Year 2025
- 54% of LinkedIn posts >100 words estimated AI-generated (Originality.ai)
- Grammarly: $700M ARR, 40M daily users — proves writing tool market at scale
- AI posts on LinkedIn see 45% less engagement and 30% lower reach
- Browser extension market: average successful extension $862K/year at 70-85% margins
- Bloomberg, NPR, Fast Company all covered "AI slop fatigue" in 2025-2026

### Round 2: Research Swarm (5 agents)

**Bull (7.5/10):**
- Cultural moment is now — AI slop mentions up 9x from 2024
- Shareable score cards are the viral distribution mechanic
- Grammarly is structurally conflicted (their AI features produce the slop they'd be scoring)
- At 500K free users, 5% conversion = £249K/year

**Bear (8/10):**
- No moat — scoring rubric is replicable via a prompt
- £9.99/year is structurally thin for API-cost business
- Grammarly could ship this as a feature with 40M existing users
- Adjacent startups (Jasper, Copy.ai) raised $200M+ combined and still struggled

**Customer Impact (7/10):**
- Three validated personas: content strategist (daily pain), hiring manager (peak pain), newsletter writer (persistent anxiety)
- People ARE building DIY tools (ThatSlop, Slop Evader, GitHub checklists) — switching signal
- Reader mode drives adoption, Writer mode drives retention — different audiences, same funnel
- The real incumbent is "I'll just read it myself"

**Technical (8/10):**
- Hybrid architecture is the key unlock: client-side scoring = free, server-side rewrites = paid
- Rewrite cost: ~1.2p per call. Break-even at 53 rewrites/user/year
- URL scraping ~60% reliable — fallback to paste is mandatory
- Build time: 2-3 days

**Devil's Advocate (7/10):**
- Irony problem: using Claude to fix Claude's patterns. Rewrites may develop their own fingerprints
- Reader mode churn: scoring a URL is fun ~4 times. Needs a retention hook
- Weaponisation risk: "my CEO's memo scored 97% slop" screenshots will define the brand
- False positive cascades: human writers flagged as sloppy could cause PR damage

---

## Confidence Scores

| Dimension | Score | Rationale |
|---|---|---|
| Desirability | 8/10 | Pain validated, mainstream, escalating. People building DIY tools. Cultural moment. |
| Viability | 6.5/10 | Hybrid architecture solves unit economics. But no moat, incumbent risk, thin ARPU. |
| Feasibility | 8.5/10 | Proven stack, 2-3 day build. URL scraping is the only technical risk. |
| **Overall** | **7.7/10** | **Worth building.** |

---

## Design Decisions

1. **Scoring is client-side, rules-based.** No API cost. Transparent rubric. Fast.
2. **Rewrites are server-side Claude calls.** Rate-limited to 3/day on free tier.
3. **Reader mode needs a retention hook.** Score history or "track this publication" to prevent 4-use churn.
4. **Explicit "not a detector" positioning.** Every screen reinforces: quality score, not authorship claim.
5. **Weaponisation guardrail.** Users can share their own scores. No shareable cards with other people's URLs/names by default.
6. **Paste fallback for blocked URLs.** Clear UX messaging when scrape fails.

---

## MVP Scope

### In (v1)
- Paste a URL → scrape → AI Slop Score + breakdown of patterns found
- Paste text → AI Slop Score + breakdown
- Writer mode: rewrite button (Claude Sonnet) with 3/day free cap
- Score breakdown: shows which patterns were detected (cliches, hedging, robotic structure, etc.)
- Clean, fast, single-page app

### Out (v2+)
- Browser extension (inline scoring on any page)
- Score history / track publications over time
- Pro tier (£9.99/year) with Stripe billing
- Team dashboards
- Tone/voice customisation for rewrites

---

## Next Steps

- [ ] Build MVP web app
- [ ] Deploy to Vercel
- [ ] Push to github.com/cla1redonald/de-ai-ify
- [ ] Update GitHub profile pins
