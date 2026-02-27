export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cuisine: string;
  mealType: MealType[];
  dietaryTags: string[];
  difficulty: Difficulty;
  prepTimeMins: number;
  cookTimeMins: number;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  aiGenerated: boolean;
  createdAt: string;
}

export interface RecipeCard {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string;
  difficulty: Difficulty;
  prepTimeMins: number;
  calories: number;
  dietaryTags: string[];
  aiGenerated: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
  timerMins?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RecipeFilters {
  cuisine?: string;
  dietary?: string;
  difficulty?: Difficulty;
  mealType?: MealType;
  maxCalories?: number;
  maxPrepTime?: number;
  page?: number;
  limit?: number;
}

export interface RecipeListResponse {
  recipes: RecipeCard[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerateRecipeRequest {
  ingredients?: string[];
  mood?: string;
  dietary?: string;
  skill?: string;
  cuisine?: string;
}

export interface FridgeRecipesRequest {
  ingredients: string[];
}

export interface SavedRecipe extends RecipeCard {
  savedAt: string;
  notes?: string;
}
