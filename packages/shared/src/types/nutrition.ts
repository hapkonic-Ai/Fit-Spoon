export interface NutritionGoals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface NutritionTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: LogMealType;
  recipeId?: string;
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string;
}

export type LogMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyNutrition {
  date: string;
  totals: NutritionTotals;
  goal: NutritionGoals;
  meals: MealLog[];
  waterGlasses: number;
}

export interface DailyNutritionSummary {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface LogMealRequest {
  mealType: LogMealType;
  mealName: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  recipeId?: string;
}

export interface WaterLogResponse {
  glasses: number;
}
