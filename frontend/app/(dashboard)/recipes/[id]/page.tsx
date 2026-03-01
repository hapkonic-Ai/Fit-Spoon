'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Clock, ChefHat, Flame, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WarmButton } from '@/components/atoms/WarmButton';
import { MacroBar } from '@/components/atoms/MacroBar';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import api from '@/lib/api';
import type { Recipe } from '@chefmate/shared';

const TABS = ['Ingredients', 'Instructions', 'Nutrition', 'Tips'] as const;
type Tab = (typeof TABS)[number];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#52B788',
  medium: '#FFB703',
  hard: '#EF476F',
};

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Ingredients');
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery<{ recipe: Recipe }>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await api.get(`/recipes/${id}`);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post(`/recipes/${id}/save`),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['recipes', 'saved'] });
    },
  });

  const recipe = data?.recipe;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <ChefMateAvatar state="cooking" size="md" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 px-4">
        <ChefMateAvatar state="idle" size="lg" />
        <p style={{ color: 'var(--color-text-muted)' }}>Recipe not found</p>
        <WarmButton onClick={() => router.push('/recipes')} variant="ghost">
          Browse Recipes
        </WarmButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero image */}
      <div className="relative h-56 sm:h-72 overflow-hidden" style={{ background: 'var(--gradient-latte)' }}>
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(58,45,40,0.6) 0%, transparent 60%)' }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--color-text)' }} />
        </button>

        {/* Save button */}
        <button
          onClick={() => saveMutation.mutate()}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        >
          <Heart
            size={18}
            fill={saved ? 'var(--color-accent)' : 'none'}
            style={{ color: saved ? 'var(--color-accent)' : 'var(--color-text)' }}
          />
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-16">
          <h1
            className="text-xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            {recipe.title}
          </h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Clock size={14} />, label: `${recipe.prepTimeMins + recipe.cookTimeMins}m`, sub: 'Total' },
            { icon: <Flame size={14} />, label: String(recipe.calories), sub: 'kcal' },
            { icon: <ChefHat size={14} />, label: recipe.difficulty, sub: 'Level', color: DIFFICULTY_COLORS[recipe.difficulty] },
            { icon: <Users size={14} />, label: String(recipe.servings), sub: 'Servings' },
          ].map((stat) => (
            <div
              key={stat.sub}
              className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1 text-center"
            >
              <span style={{ color: stat.color || 'var(--color-gold)' }}>{stat.icon}</span>
              <span
                className="text-sm font-bold capitalize"
                style={{ color: stat.color || 'var(--color-text)' }}
              >
                {stat.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {recipe.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.dietaryTags?.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium capitalize"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              {tag.replace('_', '-')}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 rounded-2xl p-1 glass-card"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: activeTab === tab ? 'rgba(212,168,83,0.15)' : 'transparent',
                color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'Ingredients' && (
            <ul className="space-y-2">
              {recipe.ingredients?.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 py-2 border-b last:border-0 text-sm"
                  style={{ borderColor: 'rgba(212,168,83,0.2)' }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(212,168,83,0.15)', color: 'var(--color-gold)' }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--color-text)' }}>
                    <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'Instructions' && (
            <ol className="space-y-4">
              {recipe.steps?.map((step) => (
                <li key={step.stepNumber} className="flex gap-4">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                    style={{ background: 'var(--gradient-luxury)', color: 'white' }}
                  >
                    {step.stepNumber}
                  </span>
                  <div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {step.instruction}
                    </p>
                    {step.tip && (
                      <p
                        className="text-xs mt-1.5 px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--color-secondary)' + '30', color: 'var(--color-text-muted)' }}
                      >
                        💡 {step.tip}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {activeTab === 'Nutrition' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Calories', value: recipe.calories, unit: 'kcal', color: 'var(--color-gold)' },
                  { label: 'Protein', value: recipe.proteinG, unit: 'g', color: '#FF8C42' },
                  { label: 'Carbs', value: recipe.carbsG, unit: 'g', color: '#FFD166' },
                  { label: 'Fat', value: recipe.fatG, unit: 'g', color: '#EF476F' },
                  { label: 'Fiber', value: recipe.fiberG, unit: 'g', color: '#52B788' },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="glass-card rounded-2xl p-3 text-center"
                    style={{ boxShadow: 'var(--shadow-luxury)' }}
                  >
                    <p className="text-xl font-bold" style={{ color: n.color }}>{n.value}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{n.label} ({n.unit})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Tips' && (
            <div className="space-y-3">
              {recipe.steps?.filter((s) => s.tip).map((step) => (
                <div
                  key={step.stepNumber}
                  className="flex gap-3 p-4 rounded-2xl glass-card"
                >
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                      Step {step.stepNumber}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{step.tip}</p>
                  </div>
                </div>
              ))}
              {recipe.steps?.filter((s) => s.tip).length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  No special tips for this recipe. Just cook with love! ❤️
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Cook button */}
        <WarmButton
          className="w-full"
          variant="gold"
          onClick={() => router.push(`/cooking/${id}`)}
        >
          Start Cooking Mode 🍳
        </WarmButton>
      </div>
    </div>
  );
}
