import type { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next) {
  if (process.env.NODE_ENV === 'production') {
    return next();
  }

  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const status = c.res.status;
  const emoji = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';
  console.log(`${emoji} ${c.req.method} ${c.req.path} ${status} +${ms}ms`);
}
