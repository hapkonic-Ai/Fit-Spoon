import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, ilike, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { recipes, savedRecipes } from '../db/schema.js';
import { generateRecipe } from '../services/ai/recipeGen.js';
import {
  generateRecipeSchema,
  recipeFiltersSchema,
} from '../lib/validation.js';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = new Hono();

// GET /recipes — Browse recipes with filters
router.get('/', authMiddleware, zValidator('query', recipeFiltersSchema), async (c) => {
  const { cuisine, dietary, difficulty, maxCalories, maxPrepTime, q, page, limit } =
    c.req.valid('query');

  const conditions = [];
  if (cuisine) conditions.push(ilike(recipes.cuisine, `%${cuisine}%`));
  if (difficulty) conditions.push(eq(recipes.difficulty, difficulty));
  if (maxCalories) conditions.push(lte(recipes.calories, maxCalories));
  if (maxPrepTime) conditions.push(lte(recipes.prepTimeMins, maxPrepTime));
  if (q) conditions.push(ilike(recipes.title, `%${q}%`));
  if (dietary) {
    conditions.push(sql`${dietary} = ANY(${recipes.dietaryTags})`);
  }

  const offset = (page - 1) * limit;

  const [recipeList, countResult] = await Promise.all([
    db
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
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(recipes)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  return c.json({
    recipes: recipeList,
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

// GET /recipes/saved
router.get('/saved', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const saved = await db
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
      savedAt: savedRecipes.savedAt,
    })
    .from(savedRecipes)
    .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
    .where(eq(savedRecipes.userId, userId));

  return c.json({ recipes: saved });
});

// POST /recipes/generate — AI generation
router.post(
  '/generate',
  authMiddleware,
  rateLimitMiddleware('AI_GENERATE'),
  zValidator('json', generateRecipeSchema),
  async (c) => {
    const params = c.req.valid('json');
    const recipe = await generateRecipe(params);

    // Save AI-generated recipe to DB
    const [saved] = await db
      .insert(recipes)
      .values({
        title: recipe.title as string,
        description: recipe.description as string,
        cuisine: recipe.cuisine as string,
        dietaryTags: recipe.dietaryTags as string[],
        difficulty: recipe.difficulty as string,
        prepTimeMins: recipe.prepTimeMins as number,
        cookTimeMins: recipe.cookTimeMins as number,
        servings: recipe.servings as number,
        calories: recipe.calories as number,
        proteinG: String(recipe.proteinG),
        carbsG: String(recipe.carbsG),
        fatG: String(recipe.fatG),
        fiberG: String(recipe.fiberG),
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        chefNote: recipe.chefNote as string,
        aiGenerated: true,
      })
      .returning();

    return c.json({ recipe: saved }, 201);
  }
);

// GET /recipes/:id
router.get('/:id', authMiddleware, async (c) => {
  const { id } = c.req.param();

  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  if (!recipe) throw Errors.notFound('recipe');

  return c.json({ recipe });
});

// POST /recipes/:id/save
router.post('/:id/save', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { id: recipeId } = c.req.param();

  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);
  if (!recipe) throw Errors.notFound('recipe');

  // Toggle save/unsave
  const [existing] = await db
    .select()
    .from(savedRecipes)
    .where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)))
    .limit(1);

  if (existing) {
    await db
      .delete(savedRecipes)
      .where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));
    return c.json({ saved: false });
  } else {
    await db.insert(savedRecipes).values({ userId, recipeId });
    return c.json({ saved: true });
  }
});

export default router;
