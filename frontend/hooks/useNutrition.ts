'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useEffect } from 'react';
import type { DailyNutrition } from '@chefmate/shared';

export function useNutritionToday() {
  const setTodayNutrition = useNutritionStore((s) => s.setTodayNutrition);
  const setWaterGlasses = useNutritionStore((s) => s.setWaterGlasses);

  const query = useQuery({
    queryKey: ['nutrition', 'today'],
    queryFn: async () => {
      const { data } = await api.get<DailyNutrition>('/nutrition/today');
      return data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setTodayNutrition({
        calories: query.data.totals.calories,
        protein: query.data.totals.proteinG,
        carbs: query.data.totals.carbsG,
        fat: query.data.totals.fatG,
      });
      setWaterGlasses(query.data.waterGlasses);
    }
  }, [query.data, setTodayNutrition, setWaterGlasses]);

  return query;
}

export function useLogMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meal: {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      mealName: string;
      calories: number;
      proteinG?: number;
      carbsG?: number;
      fatG?: number;
    }) => {
      const { data } = await api.post('/nutrition/log', meal);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] });
      toast.success("Meal logged! Great job nourishing yourself. 🌿");
    },
    onError: () => {
      toast.error("Couldn't log that meal. Try again! 🍳");
    },
  });
}

export function useWaterLog() {
  const queryClient = useQueryClient();
  const setWaterGlasses = useNutritionStore((s) => s.setWaterGlasses);

  return useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      const { data } = await api.post<{ glasses: number }>('/nutrition/water', { action });
      return data;
    },
    onSuccess: (data) => {
      setWaterGlasses(data.glasses);
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] });
      if (data.glasses >= 8) {
        toast.success("Hydration Hero unlocked! 💧 Amazing job!");
      }
    },
  });
}
