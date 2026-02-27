import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import apiRoutes from './routes/index.js';

const app = new Hono();

// ─── GLOBAL MIDDLEWARE ─────────────────────────────────────────────
app.use('*', requestLogger);
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-RateLimit-Type', 'X-RateLimit-Limit'],
    credentials: true,
  })
);

// General rate limit on all API routes
app.use('/api/*', rateLimitMiddleware('GENERAL'));

// ─── ROUTES ───────────────────────────────────────────────────────
app.route('/api', apiRoutes);

// Health check
app.get('/health', (c) =>
  c.json({
    status: 'ok',
    message: "ChefMate's kitchen is open! 🍳",
    timestamp: new Date().toISOString(),
  })
);

// 404 handler
app.notFound((c) =>
  c.json(
    {
      error: 'NOT_FOUND',
      warmMessage: "Hmm, I couldn't find that recipe. Let's search together! 🔍",
    },
    404
  )
);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────
app.onError(async (err, c) => {
  // Re-use middleware error handler
  const mockNext = async () => { throw err; };
  const result = await errorHandler(c, mockNext).catch(() => null);
  return result ?? c.json({ error: 'INTERNAL_ERROR', warmMessage: "Something got burned in the kitchen! 🔥" }, 500);
});

// ─── START SERVER ─────────────────────────────────────────────────
const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`\n🍳 ChefMate API running on http://localhost:${port}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 CORS: ${process.env.CORS_ORIGIN}`);
  console.log(`🤖 AI Model: claude-sonnet-4-6\n`);
});

export default app;
