import type { Context, Next } from 'hono';
import { AppError } from '../lib/errors.js';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json(
        {
          error: err.code,
          warmMessage: err.warmMessage,
          ...(process.env.NODE_ENV === 'development' && { details: err.message }),
          ...(err.code === 'RATE_LIMITED' && {
            retryAfter: extractRetryAfter(err.warmMessage),
          }),
        },
        err.statusCode as Parameters<typeof c.json>[1]
      );
    }

    // Unhandled errors
    console.error('[Unhandled Error]', err);
    return c.json(
      {
        error: 'INTERNAL_ERROR',
        warmMessage: "Something got burned in the kitchen! 🔥 We're fixing it now.",
        ...(process.env.NODE_ENV === 'development' && {
          details: err instanceof Error ? err.message : String(err),
        }),
      },
      500
    );
  }
}

function extractRetryAfter(warmMessage: string): number {
  const match = warmMessage.match(/(\d+) seconds/);
  return match ? parseInt(match[1], 10) : 60;
}
