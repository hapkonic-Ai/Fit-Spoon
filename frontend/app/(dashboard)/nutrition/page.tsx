'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplets, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressRing } from '@/components/atoms/ProgressRing';
import { MacroBar } from '@/components/atoms/MacroBar';
import { WarmButton } from '@/components/atoms/WarmButton';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import api from '@/lib/api';
import type { DailyNutrition } from '@chefmate/shared';

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  snack: '🍎',
  dinner: '🌙',
};

interface LogMealForm {
  mealType: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionPage() {
  const queryClient = useQueryClient();
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState<LogMealForm>({
    mealType: 'lunch',
    mealName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const { data, isLoading } = useQuery<DailyNutrition>({
    queryKey: ['nutrition', 'today'],
    queryFn: async () => {
      const res = await api.get('/nutrition/today');
      return res.data;
    },
  });

  const waterMutation = useMutation({
    mutationFn: (action: 'add' | 'remove') => api.post('/nutrition/water', { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] }),
  });

  const logMutation = useMutation({
    mutationFn: (payload: LogMealForm) => api.post('/nutrition/log', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'today'] });
      setShowLogForm(false);
      setForm({ mealType: 'lunch', mealName: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    },
  });

  const calories = data?.totals?.calories || 0;
  const calorieGoal = data?.goal?.calories || 2000;
  const caloriePercent = Math.min((calories / calorieGoal) * 100, 100);

  const macros = {
    protein: { value: data?.totals?.proteinG || 0, goal: data?.goal?.proteinG || 120, color: '#FF8C42' },
    carbs: { value: data?.totals?.carbsG || 0, goal: data?.goal?.carbsG || 250, color: '#FFD166' },
    fat: { value: data?.totals?.fatG || 0, goal: data?.goal?.fatG || 75, color: '#EF476F' },
    fiber: { value: data?.totals?.fiberG || 0, goal: data?.goal?.fiberG || 25, color: '#52B788' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ChefMateAvatar state="thinking" size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          Nutrition 🥗
        </h1>
        <WarmButton onClick={() => setShowLogForm(true)} variant="ghost" size="sm">
          <Plus size={16} className="mr-1" />
          Log Meal
        </WarmButton>
      </div>

      {/* Calorie Ring */}
      <motion.div
        className="rounded-3xl p-6 flex flex-col items-center gap-4 glass-card"
        style={{ boxShadow: 'var(--shadow-luxury)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProgressRing
          value={calories}
          max={calorieGoal}
          size={160}
          strokeWidth={14}
          color="var(--color-gold)"
          trackColor="rgba(212,168,83,0.15)"
          label={String(calories)}
          sublabel={`of ${calorieGoal} kcal`}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {calorieGoal - calories > 0
            ? `${calorieGoal - calories} kcal remaining today`
            : 'Daily goal reached! 🎉'}
        </p>
      </motion.div>

      {/* Macros */}
      <motion.div
        className="rounded-3xl p-6 space-y-4 glass-card"
        style={{ boxShadow: 'var(--shadow-luxury)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Macronutrients</h2>
        {Object.entries(macros).map(([key, macro]) => (
          <MacroBar
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={macro.value}
            max={macro.goal}
            color={macro.color}
          />
        ))}
      </motion.div>

      {/* Water Tracker */}
      <motion.div
        className="rounded-3xl p-6 glass-card"
        style={{ boxShadow: 'var(--shadow-luxury)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={18} style={{ color: 'var(--color-gold)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Water Intake</h2>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {data?.waterGlasses || 0} / 8 glasses
          </span>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Water intake tracker">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < (data?.waterGlasses || 0);
            return (
              <button
                key={i}
                onClick={() => waterMutation.mutate(filled ? 'remove' : 'add')}
                className="text-2xl transition-all hover:scale-110"
                style={filled ? { filter: 'drop-shadow(0 0 6px rgba(212,168,83,0.5))' } : undefined}
                aria-label={filled ? `Glass ${i + 1}: filled — click to remove` : `Glass ${i + 1}: empty — click to add`}
                aria-pressed={filled}
              >
                <span aria-hidden="true">{filled ? '💧' : '🤍'}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Meal Timeline */}
      <motion.div
        className="rounded-3xl p-6 glass-card"
        style={{ boxShadow: 'var(--shadow-luxury)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Today's Meals</h2>
        {data?.meals && data.meals.length > 0 ? (
          <div className="space-y-3">
            {data.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
                style={{ borderColor: 'rgba(212,168,83,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{MEAL_EMOJIS[meal.mealType] || '🍽️'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{meal.mealName}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>{meal.mealType}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                  {meal.calories} kcal
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            No meals logged yet today. Start tracking! 🍽️
          </p>
        )}
      </motion.div>

      {/* Log Meal Modal */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <motion.div
            className="w-full max-w-md rounded-3xl p-6 glass-card"
            style={{ boxShadow: 'var(--shadow-luxury)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Log a Meal</h3>

            <div className="flex gap-2 mb-4 flex-wrap">
              {MEAL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, mealType: t }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
                  style={{
                    background: form.mealType === t ? 'var(--color-gold)' : 'var(--color-bg)',
                    color: form.mealType === t ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {MEAL_EMOJIS[t]} {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border-mid)' }}
                placeholder="Meal name (e.g. Dal Rice + Salad)"
                value={form.mealName}
                onChange={(e) => setForm((f) => ({ ...f, mealName: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                {(['calories', 'protein', 'carbs', 'fat'] as const).map((field) => (
                  <input
                    key={field}
                    type="number"
                    className="px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border-mid)' }}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1) + (field === 'calories' ? ' (kcal)' : ' (g)')}
                    value={form[field] || ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: Number(e.target.value) }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                onClick={() => setShowLogForm(false)}
              >
                Cancel
              </button>
              <WarmButton
                className="flex-1"
                disabled={!form.mealName || logMutation.isPending}
                onClick={() => logMutation.mutate(form)}
              >
                {logMutation.isPending ? 'Logging...' : 'Log Meal'}
              </WarmButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
