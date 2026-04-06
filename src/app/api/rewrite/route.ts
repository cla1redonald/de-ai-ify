import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { countWords, hashIp } from "@/lib/utils";

const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are an expert editor who specialises in removing AI writing patterns from text.

Your task: rewrite the provided text to sound like it was written by a confident, direct human being.

Rules:
- Remove all AI clichés: "delve into", "navigate the complexities", "in today's rapidly evolving world", "paradigm shift", "harness the power of", "game-changer", "it's not just about X, it's about Y", etc.
- Remove transitional phrase overuse: "moreover", "furthermore", "additionally", "it is worth noting", "that being said", etc. Use them only where genuinely necessary.
- Remove corporate buzzwords: "utilize" → "use", "leverage" (as verb) → cut or rephrase, "facilitate" → be specific, "synergize", "streamline", "stakeholders", "actionable insights", etc.
- Remove hedging padding: "it's important to note that", "it's worth mentioning", "one might argue", "plays a crucial role" → say what it actually does.
- Remove robotic structural patterns: rhetorical questions answered immediately, "there are three key factors:", formulaic "first... second... third..." paragraphs unless they genuinely aid clarity.

Preserve:
- The original meaning exactly — do not add or remove substance
- The register: formal text stays formal, casual text stays casual, technical text stays technical
- Roughly the same length — do not pad or compress significantly
- Any specific facts, data, names, or claims

Do NOT:
- Add new AI patterns to replace the ones removed
- Add a preamble like "Here is the rewritten text:" — return ONLY the rewritten text
- Change the core argument or perspective
- Make it sound more formal than the original

Return ONLY the rewritten text, nothing else.`;

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

  const { text } = body as { text?: string };

  if (!text || typeof text !== "string") {
    return Response.json(
      { error: "INVALID_INPUT", message: "text field is required." },
      { status: 400 }
    );
  }

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

  if (wordCount > 5000) {
    return Response.json(
      {
        error: "INVALID_INPUT",
        message: `Text is too long (${wordCount} words). Maximum is 5,000 words.`,
      },
      { status: 400 }
    );
  }

  // Server-side rate limiting (authoritative)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkRateLimit(ip);

  const hashedIp = await hashIp(ip);
  console.log(
    `[rewrite] ip=${hashedIp} words=${wordCount} remaining=${rateLimit.remaining} allowed=${rateLimit.allowed}`
  );

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "RATE_LIMITED",
        remaining: 0,
        resetsAt: rateLimit.resetsAt,
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[rewrite] ANTHROPIC_API_KEY not set");
    return Response.json(
      { error: "REWRITE_FAILED", message: "Rewrite service is not configured." },
      { status: 500 }
    );
  }

  const startTime = Date.now();

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`[rewrite] success ip=${hashedIp} model=${MODEL} duration=${duration}ms`);

    const rewritten =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    if (!rewritten) {
      return Response.json(
        { error: "REWRITE_FAILED", message: "Rewrite failed. Try again in a moment." },
        { status: 500 }
      );
    }

    return Response.json({ rewritten, model: MODEL });
  } catch (err) {
    const duration = Date.now() - startTime;
    const statusCode = err instanceof Anthropic.APIError ? err.status : 500;
    console.error(`[rewrite] error ip=${hashedIp} status=${statusCode} duration=${duration}ms`);

    return Response.json(
      { error: "REWRITE_FAILED", message: "Rewrite failed. Try again in a moment." },
      { status: 500 }
    );
  }
}
