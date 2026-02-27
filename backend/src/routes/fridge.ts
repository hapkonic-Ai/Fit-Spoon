import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { recipes } from '../db/schema.js';
import { generateFridgeRecipes } from '../services/ai/recipeGen.js';
import { fridgeRecipesSchema } from '../lib/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';
import { eq } from 'drizzle-orm';

const router = new Hono();

// POST /fridge/recipes — Generate recipes from ingredients
router.post(
  '/recipes',
  authMiddleware,
  rateLimitMiddleware('AI_GENERATE'),
  zValidator('json', fridgeRecipesSchema),
  async (c) => {
    const { ingredients } = c.req.valid('json');

    const fridgeRecipes = await generateFridgeRecipes({ ingredients });

    // Save generated recipes to DB
    const saved = await Promise.all(
      fridgeRecipes.map(async (recipe) => {
        const [savedRecipe] = await db
          .insert(recipes)
          .values({
            title: recipe.title as string,
            description: recipe.description as string,
            cuisine: (recipe.cuisine as string) ?? 'international',
            dietaryTags: (recipe.dietaryTags as string[]) ?? [],
            difficulty: (recipe.difficulty as string) ?? 'easy',
            prepTimeMins: (recipe.prepTimeMins as number) ?? 20,
            cookTimeMins: (recipe.cookTimeMins as number) ?? 0,
            servings: (recipe.servings as number) ?? 2,
            calories: (recipe.calories as number) ?? 0,
            proteinG: String(recipe.proteinG ?? 0),
            carbsG: String(recipe.carbsG ?? 0),
            fatG: String(recipe.fatG ?? 0),
            fiberG: String(recipe.fiberG ?? 0),
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            chefNote: recipe.chefNote as string,
            aiGenerated: true,
          })
          .returning()
          .onConflictDoNothing();

        return { ...savedRecipe, missingIngredients: recipe.missingIngredients };
      })
    );

    return c.json({ recipes: saved.filter(Boolean) });
  }
);

// POST /fridge/analyze-image — Placeholder (vision feature)
router.post('/analyze-image', authMiddleware, async (c) => {
  // MVP: Return mock detected ingredients
  // TODO: Integrate Claude Vision or Google Cloud Vision
  return c.json({
    detectedIngredients: ['chicken', 'onion', 'tomato', 'garlic', 'lemon'],
    message: 'Camera analysis coming soon! For now, please type your ingredients. 🔍',
    isPlaceholder: true,
  });
});

export default router;
