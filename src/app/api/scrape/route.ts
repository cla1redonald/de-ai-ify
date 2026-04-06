import type { NextRequest } from "next/server";
import { isValidUrl, stripMarkdown, countWords } from "@/lib/utils";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "INVALID_URL", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const { url } = body as { url?: string };

  if (!url || typeof url !== "string" || !isValidUrl(url)) {
    return Response.json(
      { error: "INVALID_URL", message: "That doesn't look like a valid URL." },
      { status: 400 }
    );
  }

  // Log domain only — not full URL for privacy
  const domain = new URL(url).hostname;
  const startTime = Date.now();

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("[scrape] FIRECRAWL_API_KEY not set");
    return Response.json(
      {
        error: "SCRAPE_FAILED",
        message: "Scraping is not configured. Paste the text instead.",
      },
      { status: 422 }
    );
  }

  try {
    const { default: FirecrawlApp } = await import("firecrawl");
    const app = new FirecrawlApp({ apiKey });

    // 15-second hard timeout via Promise.race
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
        console.warn(`[scrape] timeout domain=${domain} duration=${duration}ms`);
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
      console.warn(`[scrape] no markdown domain=${domain} duration=${duration}ms`);
      return Response.json(
        {
          error: "SCRAPE_FAILED",
          message: "Couldn't fetch that page. Paste the text instead.",
        },
        { status: 422 }
      );
    }

    const text = stripMarkdown(doc.markdown);

    if (!text || countWords(text) < 20) {
      console.warn(`[scrape] empty result domain=${domain} duration=${duration}ms`);
      return Response.json(
        {
          error: "SCRAPE_FAILED",
          message: "Couldn't read any text from that page. Paste the text instead.",
        },
        { status: 422 }
      );
    }

    const wordCount = countWords(text);
    const title = doc.metadata?.title ?? domain;

    console.log(`[scrape] success domain=${domain} words=${wordCount} duration=${duration}ms`);

    return Response.json({ text, title, wordCount });
  } catch (err) {
    const duration = Date.now() - startTime;
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error(
      `[scrape] error domain=${domain} duration=${duration}ms timeout=${isTimeout}`,
      isTimeout ? "timeout" : err
    );

    return Response.json(
      {
        error: "SCRAPE_FAILED",
        message: isTimeout
          ? "That page took too long to load. Paste the text instead."
          : "Couldn't fetch that page. Paste the text instead.",
      },
      { status: 422 }
    );
  }
}
