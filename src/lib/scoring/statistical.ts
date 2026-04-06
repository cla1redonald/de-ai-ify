// Statistical text analysis — client-side, no API calls.
// These detect AI writing patterns that keyword matching misses:
// uniform sentence lengths, low vocabulary diversity, flat paragraph rhythm.

export interface StatisticalResult {
  category: string;
  weight: number;
  density: number; // 0–1 normalised
  severity: "low" | "medium" | "high";
  detail: string; // human-readable explanation
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split(/\s+/).length >= 3);
}

function getParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z']+\b/g) ?? [];
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  return stdDev(values) / mean;
}

function severity(density: number): "low" | "medium" | "high" {
  if (density < 0.35) return "low";
  if (density < 0.65) return "medium";
  return "high";
}

// ── Category: Sentence Rhythm ────────────────────────────────────────────────
// AI text has eerily uniform sentence lengths. Humans mix short punches with
// long run-ons. Low coefficient of variation = suspicious.

export function analyseSentenceRhythm(text: string): StatisticalResult {
  const sentences = getSentences(text);

  if (sentences.length < 4) {
    return {
      category: "Sentence Rhythm",
      weight: 12,
      density: 0,
      severity: "low",
      detail: "Too few sentences to measure rhythm.",
    };
  }

  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const cv = coefficientOfVariation(lengths);

  // Human writing typically has CV > 0.45
  // AI writing clusters around CV 0.2–0.35
  // Map: CV 0.45+ → density 0, CV 0.2 → density ~0.8, CV 0.1 → density ~1.0
  const density = cv >= 0.5 ? 0 : Math.max(0, 1 - cv / 0.5);

  const avgLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const sd = Math.round(stdDev(lengths) * 10) / 10;

  let detail: string;
  if (density < 0.2) {
    detail = `Good rhythm variation. Avg sentence: ${avgLen} words, std dev: ${sd}.`;
  } else if (density < 0.5) {
    detail = `Slightly uniform sentence lengths (avg ${avgLen} words, std dev ${sd}). Mixing short and long sentences would help.`;
  } else {
    detail = `Very uniform sentences (avg ${avgLen} words, std dev only ${sd}). This mechanical rhythm is a strong AI tell.`;
  }

  return { category: "Sentence Rhythm", weight: 12, density, severity: severity(density), detail };
}

// ── Category: Vocabulary Richness ────────────────────────────────────────────
// AI text reuses the same words more than humans. Type-Token Ratio (TTR)
// measures unique words / total words. We use a moving-average TTR to
// account for text length (raw TTR drops with longer texts).

export function analyseVocabularyRichness(text: string): StatisticalResult {
  const words = getWords(text);

  if (words.length < 50) {
    return {
      category: "Vocabulary Richness",
      weight: 10,
      density: 0,
      severity: "low",
      detail: "Too short to measure vocabulary diversity.",
    };
  }

  // Moving-Average TTR: compute TTR over sliding 50-word windows, then average
  const windowSize = 50;
  const ttrs: number[] = [];
  for (let i = 0; i <= words.length - windowSize; i += 10) {
    const window = words.slice(i, i + windowSize);
    const unique = new Set(window).size;
    ttrs.push(unique / windowSize);
  }

  const avgTTR = ttrs.reduce((a, b) => a + b, 0) / ttrs.length;

  // Human writing: MATTR typically 0.72+
  // AI writing: MATTR typically 0.58–0.68
  // Map: 0.75+ → density 0, 0.60 → density ~0.7, 0.50 → density ~1.0
  const density = avgTTR >= 0.75 ? 0 : Math.max(0, Math.min(1, (0.75 - avgTTR) / 0.25));

  const pct = Math.round(avgTTR * 100);

  let detail: string;
  if (density < 0.2) {
    detail = `Rich vocabulary (${pct}% unique words per window). Natural variety.`;
  } else if (density < 0.5) {
    detail = `Moderate repetition (${pct}% unique). Some word cycling typical of AI output.`;
  } else {
    detail = `Low vocabulary diversity (${pct}% unique). Heavy word reuse is a strong AI signal.`;
  }

  return { category: "Vocabulary Richness", weight: 10, density, severity: severity(density), detail };
}

// ── Category: Paragraph Burstiness ───────────────────────────────────────────
// Humans write in bursts: dense technical paragraph → short quip → long
// narrative. AI maintains a flat register throughout. We measure variance
// in paragraph word counts.

export function analyseBurstiness(text: string): StatisticalResult {
  const paragraphs = getParagraphs(text);

  if (paragraphs.length < 3) {
    return {
      category: "Paragraph Burstiness",
      weight: 8,
      density: 0,
      severity: "low",
      detail: "Too few paragraphs to measure burstiness.",
    };
  }

  const lengths = paragraphs.map((p) => p.split(/\s+/).length);
  const cv = coefficientOfVariation(lengths);

  // Human writing: paragraph length CV typically > 0.5
  // AI writing: very uniform paragraphs, CV 0.15–0.35
  const density = cv >= 0.55 ? 0 : Math.max(0, 1 - cv / 0.55);

  let detail: string;
  if (density < 0.2) {
    detail = `Good paragraph variety. Natural burst pattern.`;
  } else if (density < 0.5) {
    detail = `Slightly uniform paragraphs. Could use more variation in density.`;
  } else {
    detail = `Very uniform paragraph lengths. This flat rhythm is typical of AI-generated text.`;
  }

  return { category: "Paragraph Burstiness", weight: 8, density, severity: severity(density), detail };
}

// ── Run all statistical analyses ─────────────────────────────────────────────

export function analyseAllStatistical(text: string): StatisticalResult[] {
  return [
    analyseSentenceRhythm(text),
    analyseVocabularyRichness(text),
    analyseBurstiness(text),
  ];
}
