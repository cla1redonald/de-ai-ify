// Server-side rate limiter — in-memory Map (MVP).
// Resets on cold start; acceptable for soft limiting without billing enforcement.
// Upgrade path: replace Map with Vercel KV or Upstash Redis for Pro tier.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsAt: string; // ISO timestamp
}

const MAX_REWRITES_PER_DAY = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

// Module-scope Map — persists across requests within the same serverless instance.
const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = store.get(ip);

  let record: RateLimitRecord;

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    // No record or window expired — start fresh (don't increment yet)
    record = { count: 0, windowStart: now };
  } else {
    record = existing;
  }

  const resetsAt = new Date(record.windowStart + WINDOW_MS).toISOString();

  if (record.count >= MAX_REWRITES_PER_DAY) {
    return { allowed: false, remaining: 0, resetsAt };
  }

  // Increment and persist
  record.count += 1;
  store.set(ip, record);

  return {
    allowed: true,
    remaining: MAX_REWRITES_PER_DAY - record.count,
    resetsAt,
  };
}
