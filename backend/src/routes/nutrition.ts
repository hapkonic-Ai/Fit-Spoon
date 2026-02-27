import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, sql, gte, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { nutritionLogs, waterLogs, userPreferences } from '../db/schema.js';
import { logMealSchema, waterLogSchema, updateNutritionGoalsSchema } from '../lib/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = new Hono();

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

// GET /nutrition/today
router.get('/today', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const today = todayDate();

  const [meals, waterResult, prefs] = await Promise.all([
    db
      .select()
      .from(nutritionLogs)
      .where(and(eq(nutritionLogs.userId, userId), eq(nutritionLogs.date, today))),
    db
      .select()
      .from(waterLogs)
      .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, today)))
      .limit(1),
    db
      .select({
        calorieGoal: userPreferences.calorieGoal,
        proteinGoal: userPreferences.proteinGoal,
        carbGoal: userPreferences.carbGoal,
        fatGoal: userPreferences.fatGoal,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
  ]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      proteinG: acc.proteinG + Number(m.proteinG ?? 0),
      carbsG: acc.carbsG + Number(m.carbsG ?? 0),
      fatG: acc.fatG + Number(m.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const goal = prefs[0];

  return c.json({
    date: today,
    totals,
    goal: {
      calories: goal?.calorieGoal ?? 2000,
      proteinG: goal?.proteinGoal ?? 120,
      carbsG: goal?.carbGoal ?? 250,
      fatG: goal?.fatGoal ?? 75,
      fiberG: 25,
    },
    meals,
    waterGlasses: waterResult[0]?.glasses ?? 0,
  });
});

// POST /nutrition/log
router.post('/log', authMiddleware, zValidator('json', logMealSchema), async (c) => {
  const userId = c.get('userId');
  const today = todayDate();
  const data = c.req.valid('json');

  const [entry] = await db
    .insert(nutritionLogs)
    .values({
      userId,
      date: today,
      mealType: data.mealType,
      mealName: data.mealName,
      calories: data.calories,
      proteinG: data.proteinG ? String(data.proteinG) : '0',
      carbsG: data.carbsG ? String(data.carbsG) : '0',
      fatG: data.fatG ? String(data.fatG) : '0',
      recipeId: data.recipeId,
    })
    .returning();

  return c.json({ entry }, 201);
});

// GET /nutrition/history?days=7
router.get('/history', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const days = Math.min(Number(c.req.query('days') ?? 7), 30);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const logs = await db
    .select({
      date: nutritionLogs.date,
      calories: sql<number>`sum(${nutritionLogs.calories})::int`,
      proteinG: sql<number>`sum(${nutritionLogs.proteinG})::numeric`,
      carbsG: sql<number>`sum(${nutritionLogs.carbsG})::numeric`,
      fatG: sql<number>`sum(${nutritionLogs.fatG})::numeric`,
    })
    .from(nutritionLogs)
    .where(and(eq(nutritionLogs.userId, userId), gte(nutritionLogs.date, sinceStr)))
    .groupBy(nutritionLogs.date)
    .orderBy(desc(nutritionLogs.date));

  return c.json({ history: logs });
});

// POST /nutrition/water
router.post('/water', authMiddleware, zValidator('json', waterLogSchema), async (c) => {
  const userId = c.get('userId');
  const today = todayDate();
  const { action } = c.req.valid('json');

  const [existing] = await db
    .select()
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, today)))
    .limit(1);

  let glasses: number;

  if (!existing) {
    const [row] = await db
      .insert(waterLogs)
      .values({ userId, date: today, glasses: action === 'add' ? 1 : 0 })
      .returning({ glasses: waterLogs.glasses });
    glasses = row.glasses ?? 0;
  } else {
    const newGlasses = Math.max(0, (existing.glasses ?? 0) + (action === 'add' ? 1 : -1));
    const [row] = await db
      .update(waterLogs)
      .set({ glasses: newGlasses, updatedAt: new Date() })
      .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, today)))
      .returning({ glasses: waterLogs.glasses });
    glasses = row.glasses ?? 0;
  }

  return c.json({ glasses });
});

// GET /nutrition/goals
router.get('/goals', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [prefs] = await db
    .select({
      calories: userPreferences.calorieGoal,
      proteinG: userPreferences.proteinGoal,
      carbsG: userPreferences.carbGoal,
      fatG: userPreferences.fatGoal,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return c.json({ goals: { ...prefs, fiberG: 25 } });
});

// PUT /nutrition/goals
router.put('/goals', authMiddleware, zValidator('json', updateNutritionGoalsSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  await db
    .update(userPreferences)
    .set({
      calorieGoal: data.calories,
      proteinGoal: data.proteinG,
      carbGoal: data.carbsG,
      fatGoal: data.fatG,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, userId));

  return c.json({ goals: data });
});

export default router;
