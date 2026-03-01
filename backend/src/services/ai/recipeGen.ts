import { model, withRetry } from './client.js';
import { aiQueue } from '../../lib/queue.js';
import { Errors } from '../../lib/errors.js';

interface GenerateRecipeParams {
  ingredients?: string[];
  mood?: string;
  dietary?: string;
  skill?: string;
  cuisine?: string;
}

interface FridgeRecipesParams {
  ingredients: string[];
  dietary?: string;
}

const RECIPE_JSON_PROMPT = `
Output ONLY valid JSON matching this exact schema. No markdown, no explanation:
{
  "title": "string",
  "description": "string (2 warm sentences)",
  "cuisine": "string",
  "dietaryTags": ["string"],
  "difficulty": "easy|medium|hard",
  "prepTimeMins": number,
  "cookTimeMins": number,
  "servings": number,
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "fiberG": number,
  "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
  "steps": [{"stepNumber": number, "instruction": "string", "tip": "string|null"}],
  "chefNote": "string (warm encouragement)"
}`;

export async function generateRecipe(params: GenerateRecipeParams): Promise<Record<string, unknown>> {
  const prompt = `Generate a single delicious recipe with these parameters:
- Available ingredients: ${params.ingredients?.join(', ') || 'anything'}
- Dietary preference: ${params.dietary || 'omnivore'}
- Cooking skill: ${params.skill || 'intermediate'}
- Cuisine preference: ${params.cuisine || 'any'}
- User mood: ${params.mood || 'neutral'}

${RECIPE_JSON_PROMPT}`;

  return aiQueue.add(() =>
    withRetry(async () => {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw Errors.aiError();

      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    })
  );
}

export async function generateFridgeRecipes(
  params: FridgeRecipesParams
): Promise<Record<string, unknown>[]> {
  const prompt = `A home cook has these ingredients: ${params.ingredients.join(', ')}
Dietary preference: ${params.dietary || 'omnivore'}

Generate exactly 3 DIFFERENT recipes they can make NOW with mostly these ingredients.
Allow 1-2 common pantry items per recipe (salt, oil, basic spices).
Make recipes diverse: one quick (under 20min), one hearty, one light/fresh.

Output a JSON array of 3 recipes. Each recipe matches this schema:
${RECIPE_JSON_PROMPT}
Also add "missingIngredients": ["string"] to each recipe for items they might not have.

Output ONLY the JSON array, no other text.`;

  return aiQueue.add(() =>
    withRetry(async () => {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw Errors.aiError();

      return JSON.parse(jsonMatch[0]) as Record<string, unknown>[];
    })
  );
}
