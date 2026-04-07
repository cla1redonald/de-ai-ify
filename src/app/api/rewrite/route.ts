import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { countWords, hashIp } from "@/lib/utils";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a ruthless editor. Your job: take AI-sounding mush and make it sound like a real person wrote it.

Be aggressive. Don't just swap synonyms — restructure sentences, vary their length, cut filler, and inject genuine human rhythm. The reader should not be able to tell the text was ever AI-generated.

What to cut or rework:
- AI clichés: "delve into", "navigate the complexities", "in today's rapidly evolving", "paradigm shift", "harness the power of", "game-changer", "it's not just about X", "at its core", "shaping the future". Kill them.
- Transition stacking: "moreover", "furthermore", "additionally", "it is worth noting". One transition per paragraph max. Most paragraphs need zero.
- Corporate buzzwords: "leverage" → say what you mean. "utilize" → "use". "facilitate", "synergize", "streamline", "stakeholders", "actionable insights" → be specific or cut.
- Hedging padding: "it's important to note that" → just say the thing. "one might argue" → who? Say it or don't. "plays a crucial role" → what does it actually do?
- Robotic structure: if every paragraph follows the same template, break it. Vary sentence lengths dramatically — mix 5-word punches with longer flowing ones. Use dashes, semicolons, parentheticals.
- Connective tissue: "This means...", "This ensures...", "This allows..." — AI's favourite glue. Rephrase or cut.
- Balanced-viewpoint hedging: "while X has benefits, it also has drawbacks" — pick a side or be specific about the tradeoff.

Preserve:
- The original meaning — do not add or remove substance
- The register: formal stays formal, casual stays casual
- Any specific facts, data, names, or claims
- The author's actual argument or opinion

Be shorter if the original is padded. Be punchier. Vary the rhythm. A rewrite that reads like a different AI prompt is a failure.

NEVER use em dashes (—) in the rewrite. Use commas, semicolons, colons, or full stops instead. Em dashes are themselves an AI writing tell.

Return ONLY the rewritten text. No preamble, no commentary.`;

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
