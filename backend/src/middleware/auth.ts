import type { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { Errors } from '../lib/errors.js';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret');

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw Errors.unauthorized();
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.sub) {
      throw Errors.unauthorized();
    }

    c.set('userId', payload.sub);
    c.set('userEmail', payload.email as string);
    await next();
  } catch (err) {
    if (err instanceof Error && err.message.includes('expired')) {
      throw Errors.tokenExpired();
    }
    throw Errors.unauthorized();
  }
}

// Optional auth — doesn't fail if no token, just doesn't set userId
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.sub) {
        c.set('userId', payload.sub);
        c.set('userEmail', payload.email as string);
      }
    } catch {
      // ignore — optional
    }
  }

  await next();
}
