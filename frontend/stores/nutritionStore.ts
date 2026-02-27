import { create } from 'zustand';

interface NutritionState {
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  waterGlasses: number;
  calorieGoal: number;
  setTodayNutrition: (data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
  setWaterGlasses: (glasses: number) => void;
  setCalorieGoal: (goal: number) => void;
  addMealCalories: (calories: number) => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  todayCalories: 0,
  todayProtein: 0,
  todayCarbs: 0,
  todayFat: 0,
  waterGlasses: 0,
  calorieGoal: 2000,

  setTodayNutrition: (data) =>
    set({
      todayCalories: data.calories,
      todayProtein: data.protein,
      todayCarbs: data.carbs,
      todayFat: data.fat,
    }),

  setWaterGlasses: (glasses) => set({ waterGlasses: glasses }),

  setCalorieGoal: (goal) => set({ calorieGoal: goal }),

  addMealCalories: (calories) =>
    set((state) => ({ todayCalories: state.todayCalories + calories })),
}));
