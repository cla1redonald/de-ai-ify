// TODO(@engineer): Implement server-side rate limiter.
//
// Used by: src/app/api/rewrite/route.ts
//
// Strategy: in-memory Map keyed by IP address (MVP — resets on cold start).
// This is soft limiting, not billing enforcement. Cold start resets are acceptable.
// Upgrade path: replace Map with Vercel KV or Upstash Redis when Pro tier ships.
//
// Data shape:
//   Map<string, { count: number, windowStart: number }>
//   windowStart is a Unix timestamp (Date.now())
//
// Public API:
//
//   checkRateLimit(ip: string): RateLimitResult
//
//   interface RateLimitResult {
//     allowed: boolean
//     remaining: number      // rewrites left in current window
//     resetsAt: string       // ISO timestamp when window resets
//   }
//
// Algorithm:
//   1. Get record for IP from Map.
//   2. If no record, or windowStart > 24h ago: reset to { count: 0, windowStart: now }.
//   3. If count >= MAX_REWRITES_PER_DAY (3): return { allowed: false, remaining: 0, resetsAt }
//   4. Increment count. Return { allowed: true, remaining: MAX - count, resetsAt }
//
// Constants:
//   MAX_REWRITES_PER_DAY = 3
//   WINDOW_MS = 24 * 60 * 60 * 1000  (24 hours)
//
// Note: the store Map must be declared at module scope (outside the function)
// so it persists across requests within the same serverless instance lifetime.
//
// See docs/architecture.md §"Rate Limiting Strategy".

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsAt: string;
}

export function checkRateLimit(_ip: string): RateLimitResult {
  // TODO: implement
  return {
    allowed: true,
    remaining: 3,
    resetsAt: new Date(Date.now() + 86400000).toISOString(),
  };
}
