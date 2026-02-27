import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().uuid().nullable().optional(),
  context: z
    .object({
      mood: z.string().optional(),
      ingredients: z.array(z.string()).optional(),
    })
    .optional(),
});

export const generateRecipeSchema = z.object({
  ingredients: z.array(z.string()).optional(),
  mood: z.string().optional(),
  dietary: z.string().optional(),
  skill: z.string().optional(),
  cuisine: z.string().optional(),
});

export const fridgeRecipesSchema = z.object({
  ingredients: z.array(z.string()).min(1, 'Add at least one ingredient').max(20),
});

export const logMealSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  mealName: z.string().min(1).max(100),
  calories: z.number().int().min(0).max(5000),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  recipeId: z.string().uuid().optional(),
});

export const waterLogSchema = z.object({
  action: z.enum(['add', 'remove']),
});

export const moodLogSchema = z.object({
  mood: z.enum(['happy', 'stressed', 'tired', 'unwell', 'celebratory', 'sad', 'motivated', 'calm']),
  note: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updatePreferencesSchema = z.object({
  dietaryType: z
    .enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'flexitarian', 'keto', 'paleo'])
    .optional(),
  allergies: z.array(z.string()).optional(),
  cuisines: z.array(z.string()).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'chef']).optional(),
  healthGoal: z
    .enum(['lose-weight', 'build-muscle', 'eat-healthier', 'enjoy-food', 'manage-health', 'maintain'])
    .optional(),
  calorieGoal: z.number().int().min(500).max(5000).optional(),
  proteinGoal: z.number().int().min(0).optional(),
  carbGoal: z.number().int().min(0).optional(),
  fatGoal: z.number().int().min(0).optional(),
  theme: z.enum(['warm-light', 'cozy-dark', 'soft-pastel']).optional(),
  aiPersonality: z.enum(['warm', 'professional', 'playful']).optional(),
  language: z.string().optional(),
});

export const updateNutritionGoalsSchema = z.object({
  calories: z.number().int().min(500).max(5000),
  proteinG: z.number().min(0),
  carbsG: z.number().min(0),
  fatG: z.number().min(0),
  fiberG: z.number().min(0),
});

export const recipeFiltersSchema = z.object({
  cuisine: z.string().optional(),
  dietary: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).optional(),
  maxCalories: z.coerce.number().optional(),
  maxPrepTime: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().optional(),
});
