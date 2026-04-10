import type { NextRequest } from "next/server";
import { countWords, isValidUrl, stripMarkdown } from "@/lib/utils";
import { calculateScore, toScoreResult } from "@/lib/scoring/engine";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "INVALID_INPUT", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const { text: rawText, url } = body as { text?: string; url?: string };

  let text: string;

  if (url && typeof url === "string") {
    // ── Scrape URL to get text ───────────────────────────────────────────
    if (!isValidUrl(url)) {
      return Response.json(
        { error: "INVALID_INPUT", message: "That doesn't look like a valid URL." },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.error("[score] FIRECRAWL_API_KEY not set");
      return Response.json(
        {
          error: "SCRAPE_FAILED",
          message: "Scraping is not configured. Paste the text instead.",
        },
        { status: 422 }
      );
    }

    const domain = new URL(url).hostname;
    const startTime = Date.now();

    try {
      const { default: FirecrawlApp } = await import("firecrawl");
      const app = new FirecrawlApp({ apiKey });

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AbortError")), 15000)
      );

      let doc: Awaited<ReturnType<typeof app.scrape>>;
      try {
        doc = await Promise.race([
          app.scrape(url, { formats: ["markdown"] }),
          timeout,
        ]);
      } catch (err) {
        if (err instanceof Error && err.message === "AbortError") {
          const duration = Date.now() - startTime;
          console.warn(`[score] scrape timeout domain=${domain} duration=${duration}ms`);
          return Response.json(
            {
              error: "SCRAPE_FAILED",
              message: "That page took too long to load. Paste the text instead.",
            },
            { status: 422 }
          );
        }
        throw err;
      }

      const duration = Date.now() - startTime;

      if (!doc.markdown) {
        console.warn(`[score] no markdown domain=${domain} duration=${duration}ms`);
        return Response.json(
          {
            error: "SCRAPE_FAILED",
            message: "Couldn't fetch that page. Paste the text instead.",
          },
          { status: 422 }
        );
      }

      text = stripMarkdown(doc.markdown);

      if (!text || countWords(text) < 20) {
        console.warn(`[score] empty result domain=${domain} duration=${duration}ms`);
        return Response.json(
          {
            error: "SCRAPE_FAILED",
            message: "Couldn't read enough text from that page. Paste the text instead.",
          },
          { status: 422 }
        );
      }

      console.log(`[score] scraped domain=${domain} words=${countWords(text)} duration=${duration}ms`);
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[score] scrape error domain=${domain} duration=${duration}ms`, err);
      return Response.json(
        {
          error: "SCRAPE_FAILED",
          message: "Couldn't fetch that page. Paste the text instead.",
        },
        { status: 422 }
      );
    }
  } else if (rawText && typeof rawText === "string") {
    text = rawText;
  } else {
    return Response.json(
      { error: "INVALID_INPUT", message: "Provide either a text or url field." },
      { status: 400 }
    );
  }

  // ── Validate text length ─────────────────────────────────────────────
  const wordCount = countWords(text);

  if (wordCount < 20) {
    return Response.json(
      {
        error: "INVALID_INPUT",
        message: "Text is too short. Paste at least a few sentences.",
      },
      { status: 400 }
    );
  }

  if (wordCount > 10_000) {
    return Response.json(
      {
        error: "INVALID_INPUT",
        message: `Text is too long (${wordCount} words). Maximum is 10,000 words.`,
      },
      { status: 400 }
    );
  }

  // ── Score ─────────────────────────────────────────────────────────────
  try {
    const slopScore = calculateScore(text);
    const result = toScoreResult(slopScore, text);

    return Response.json(result);
  } catch (err) {
    console.error("[score] scoring error", err);
    return Response.json(
      { error: "SCORE_FAILED", message: "Scoring failed. Try again in a moment." },
      { status: 500 }
    );
  }
}
