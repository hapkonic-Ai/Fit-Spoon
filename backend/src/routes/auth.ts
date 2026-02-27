import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userPreferences, streaks } from '../db/schema.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../services/auth.js';
import { signupSchema, loginSchema } from '../lib/validation.js';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = new Hono();

// POST /auth/signup
router.post('/signup', rateLimitMiddleware('AUTH'), zValidator('json', signupSchema), async (c) => {
  const { email, name, password } = c.req.valid('json');

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) throw Errors.emailTaken();

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({ id: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl, createdAt: users.createdAt });

  // Create default preferences and streak
  await Promise.all([
    db.insert(userPreferences).values({ userId: user.id }),
    db.insert(streaks).values({ userId: user.id }),
  ]);

  const token = await signToken(user.id, user.email);
  return c.json({ token, user }, 201);
});

// POST /auth/login
router.post('/login', rateLimitMiddleware('AUTH'), zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) throw Errors.invalidCredentials();

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw Errors.invalidCredentials();

  const token = await signToken(user.id, user.email);
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt,
    },
  });
});

// POST /auth/refresh
router.post('/refresh', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');
  const token = await signToken(userId, userEmail);
  return c.json({ token });
});

// GET /auth/me
router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl, onboardingComplete: users.onboardingComplete, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw Errors.unauthorized();
  return c.json({ user });
});

export default router;
