import type { Context, Next } from 'hono';
import { Errors } from '../lib/errors.js';
import { RATE_LIMITS } from '../lib/constants.js';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store: key = `${userId}:${route}`
const buckets = new Map<string, Bucket>();

function consumeToken(
  key: string,
  maxTokens: number,
  windowMs: number
): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { tokens: maxTokens - 1, lastRefill: now });
    return { allowed: true, retryAfterSecs: 0 };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= windowMs) {
    bucket.tokens = maxTokens;
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true, retryAfterSecs: 0 };
  }

  const retryAfterMs = windowMs - elapsed;
  return { allowed: false, retryAfterSecs: Math.ceil(retryAfterMs / 1000) };
}

// Clean up old buckets every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > 10 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimitMiddleware(
  type: keyof typeof RATE_LIMITS
) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId') ?? c.req.header('x-forwarded-for') ?? 'anonymous';
    const key = `${userId}:${type}`;
    const config = RATE_LIMITS[type];

    const { allowed, retryAfterSecs } = consumeToken(key, config.tokens, config.windowMs);

    if (!allowed) {
      throw Errors.rateLimited(retryAfterSecs);
    }

    // Add rate limit headers
    c.header('X-RateLimit-Type', type);
    c.header('X-RateLimit-Limit', String(config.tokens));

    await next();
  };
}
