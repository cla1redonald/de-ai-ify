// TODO(@engineer): Implement POST /api/rewrite
//
// Accepts: { text: string }
//
// Responses:
//   200: { rewritten: string, model: string }
//   400: { error: "INVALID_INPUT", message: string }
//   429: { error: "RATE_LIMITED", remaining: 0, resetsAt: string }
//
// Implementation:
//   1. Input validation — reject if < 20 words or > 5000 words. Return 400.
//
//   2. Server-side rate limiting (authoritative) — import from src/lib/rate-limit.ts:
//        - Key by request IP: req.headers.get('x-forwarded-for') ?? 'unknown'
//        - 3 calls per IP per 24h rolling window (in-memory Map for MVP)
//        - If limit exceeded: return 429 with resetsAt timestamp
//
//   3. Claude call — architecture specifies @anthropic-ai/sdk directly:
//        import Anthropic from '@anthropic-ai/sdk'
//        const client = new Anthropic()  // reads ANTHROPIC_API_KEY from env automatically
//        model: 'claude-sonnet-4-20250514'
//
//      Note: Vercel AI SDK (@ai-sdk/anthropic + 'ai' package) is an alternative that
//      provides streaming and provider abstraction. Evaluate if streaming rewrite output
//      to the client becomes a requirement. For non-streaming MVP, direct SDK is simpler.
//
//      System prompt must instruct Claude to:
//        - Remove AI slop patterns (transitional phrases, clichés, hedging, buzzwords)
//        - Preserve the original meaning exactly — do not add or remove substance
//        - Match the register (formal stays formal, casual stays casual)
//        - Do NOT introduce new AI patterns in the rewrite
//        - Keep roughly the same length
//        - Return ONLY the rewritten text, no preamble or explanation
//
//   4. Return { rewritten: message.content[0].text, model: 'claude-sonnet-4-20250514' }
//
//   5. Do NOT decrement rate limit on Claude API error (5xx/timeout).
//      Only count against limit when Claude returns a successful response.
//
// Observability:
//   - Log: hashed IP, word count, rate limit remaining before call
//   - Log: Claude response time, model used
//   - Log: error status code on failure (do NOT log text content — it may be sensitive)
//   - 429 rate spikes indicate abuse or limit too low — alert if > 5% of requests
//
// See docs/architecture.md §"POST /api/rewrite" and §"Rate Limiting Strategy".

import type { NextRequest } from "next/server";

export async function POST(_req: NextRequest): Promise<Response> {
  // TODO: implement
  return Response.json(
    { error: "NOT_IMPLEMENTED", message: "Rewrite route not yet implemented" },
    { status: 501 }
  );
}
