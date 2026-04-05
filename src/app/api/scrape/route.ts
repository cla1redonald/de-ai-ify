// TODO(@engineer): Implement POST /api/scrape
//
// Accepts: { url: string }
//
// Responses:
//   200: { text: string, title: string, wordCount: number }
//   400: { error: "INVALID_URL", message: string }
//   422: { error: "SCRAPE_FAILED", message: string }
//
// Implementation:
//   1. Validate URL with the URL constructor — reject non-http(s) schemes.
//   2. Use Firecrawl to scrape:
//        import FirecrawlApp from 'firecrawl'
//        const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
//        const result = await app.scrapeUrl(url, { formats: ['markdown'] })
//   3. Strip markdown syntax from result.markdown to get plain text for scoring.
//   4. Hard timeout at 15s — if Firecrawl hangs, return SCRAPE_FAILED with
//      "Couldn't fetch that page. Paste the text instead."
//   5. No rate limiting here — Firecrawl enforces limits on their API key.
//   6. FIRECRAWL_API_KEY is server-only — never expose to client.
//
// Observability:
//   - Log scrape success/failure with URL domain (not full URL — privacy) and duration.
//   - Log Firecrawl error codes for debugging. Do not log page content.
//
// See docs/architecture.md §"POST /api/scrape" for full spec.

import type { NextRequest } from "next/server";

export async function POST(_req: NextRequest): Promise<Response> {
  // TODO: implement
  return Response.json(
    { error: "NOT_IMPLEMENTED", message: "Scrape route not yet implemented" },
    { status: 501 }
  );
}
