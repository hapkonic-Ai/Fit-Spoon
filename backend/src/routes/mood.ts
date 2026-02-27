import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { moodLogs, recipes } from '../db/schema.js';
import { moodLogSchema } from '../lib/validation.js';
import { MOOD_FOOD_MAP } from '../lib/constants.js';
import { authMiddleware } from '../middleware/auth.js';
import { sql } from 'drizzle-orm';

const router = new Hono();

const MOOD_MESSAGES: Record<string, string> = {
  happy: "You're radiating sunshine today! 🌟 Let's celebrate with something fresh and vibrant.",
  stressed: "I hear you — life can feel heavy sometimes. 💕 Let me find you something warm and comforting.",
  tired: "Rest is important, and so is nourishing yourself. 🌿 Here's something to restore your energy.",
  unwell: "I'm sorry you're not feeling well. 🌼 Let me suggest some gentle, healing foods.",
  celebratory: "This calls for something special! 🎉 You deserve to treat yourself today.",
  sad: "I'm here with you. 💛 A warm, comforting meal can feel like a little hug.",
  motivated: "Love that energy! 💪 Let's fuel that fire with something powerful.",
  calm: "What a beautiful state to be in. 🍵 Let's keep that peace with mindful, nourishing food.",
};

// POST /mood/log
router.post('/log', authMiddleware, zValidator('json', moodLogSchema), async (c) => {
  const userId = c.get('userId');
  const { mood, note } = c.req.valid('json');

  const [entry] = await db
    .insert(moodLogs)
    .values({ userId, mood, note })
    .returning();

  // Get mood-matched recipes
  const moodKeywords = MOOD_FOOD_MAP[mood] ?? [];
  const moodRecipes = moodKeywords.length
    ? await db
        .select({
          id: recipes.id,
          title: recipes.title,
          imageUrl: recipes.imageUrl,
          cuisine: recipes.cuisine,
          difficulty: recipes.difficulty,
          prepTimeMins: recipes.prepTimeMins,
          calories: recipes.calories,
          dietaryTags: recipes.dietaryTags,
          aiGenerated: recipes.aiGenerated,
        })
        .from(recipes)
        .where(
          sql`lower(${recipes.title}) LIKE ANY(ARRAY[${sql.join(
            moodKeywords.map((k) => sql`'%' || lower(${k}) || '%'`),
            sql`, `
          )}])`
        )
        .limit(5)
    : await db
        .select({
          id: recipes.id,
          title: recipes.title,
          imageUrl: recipes.imageUrl,
          cuisine: recipes.cuisine,
          difficulty: recipes.difficulty,
          prepTimeMins: recipes.prepTimeMins,
          calories: recipes.calories,
          dietaryTags: recipes.dietaryTags,
          aiGenerated: recipes.aiGenerated,
        })
        .from(recipes)
        .limit(5);

  return c.json(
    {
      entry,
      recommendations: {
        recipes: moodRecipes,
        tip: getMoodTip(mood),
        moodMessage: MOOD_MESSAGES[mood] ?? "Let me find something perfect for you! 🍳",
      },
    },
    201
  );
});

// GET /mood/history
router.get('/history', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const days = Math.min(Number(c.req.query('days') ?? 7), 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await db
    .select({
      id: moodLogs.id,
      mood: moodLogs.mood,
      note: moodLogs.note,
      loggedAt: moodLogs.loggedAt,
    })
    .from(moodLogs)
    .where(eq(moodLogs.userId, userId))
    .orderBy(desc(moodLogs.loggedAt))
    .limit(days);

  return c.json({ history });
});

function getMoodTip(mood: string): string {
  const tips: Record<string, string> = {
    happy: "Great energy! Try adding colorful veggies to boost both mood and nutrition.",
    stressed: "Magnesium-rich foods like dark chocolate, nuts, and leafy greens can help calm the nervous system.",
    tired: "Iron and B12 are your friends! Try spinach, lentils, or eggs to restore energy.",
    unwell: "Stay hydrated and try ginger or turmeric — both have natural anti-inflammatory properties.",
    celebratory: "Treat yourself mindfully — savour every bite of something truly special.",
    sad: "Omega-3 fatty acids in fish and walnuts are known to support mood. And warm food = warm hugs!",
    motivated: "Complex carbs + lean protein = sustained energy. Perfect for a motivated day!",
    calm: "Mindful eating pairs perfectly with your calm energy. Eat slowly and savour.",
  };
  return tips[mood] ?? "Nourish your body and it will nourish your mind. 💚";
}

export default router;
