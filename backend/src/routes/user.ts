import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, userPreferences, streaks, userAchievements, achievements } from '../db/schema.js';
import { updateProfileSchema, updatePreferencesSchema } from '../lib/validation.js';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.js';

const router = new Hono();

// GET /user/profile
router.get('/profile', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      onboardingComplete: users.onboardingComplete,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw Errors.notFound('user');

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return c.json({ user, preferences: prefs ?? null });
});

// PUT /user/profile
router.put('/profile', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    });

  return c.json({ user: updated });
});

// PUT /user/preferences
router.put(
  '/preferences',
  authMiddleware,
  zValidator('json', updatePreferencesSchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');

    const [prefs] = await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return c.json({ preferences: prefs });
  }
);

// PUT /user/onboarding-complete
router.put('/onboarding-complete', authMiddleware, async (c) => {
  const userId = c.get('userId');

  await db
    .update(users)
    .set({ onboardingComplete: true, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return c.json({ success: true });
});

// GET /user/streak
router.get('/streak', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [streak] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  // Update streak logic
  if (streak) {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = streak.lastActiveDate;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak =
        lastActive === yesterdayStr
          ? (streak.currentStreak ?? 0) + 1
          : 1; // Streak broken

      const longestStreak = Math.max(newStreak, streak.longestStreak ?? 0);

      await db
        .update(streaks)
        .set({
          currentStreak: newStreak,
          longestStreak,
          lastActiveDate: today,
          updatedAt: new Date(),
        })
        .where(eq(streaks.userId, userId));

      return c.json({
        current: newStreak,
        longest: longestStreak,
        lastActiveDate: today,
      });
    }
  }

  return c.json({
    current: streak?.currentStreak ?? 0,
    longest: streak?.longestStreak ?? 0,
    lastActiveDate: streak?.lastActiveDate ?? null,
  });
});

// GET /user/achievements
router.get('/achievements', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const earned = await db
    .select({
      id: achievements.id,
      key: achievements.key,
      title: achievements.title,
      description: achievements.description,
      icon: achievements.icon,
      points: achievements.points,
      earnedAt: userAchievements.earnedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));

  return c.json({ achievements: earned });
});

export default router;
