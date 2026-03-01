'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Camera } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Chip } from '@/components/atoms/Chip';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';
import { RecipeCard } from '@/components/molecules/RecipeCard';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import api from '@/lib/api';
import type { RecipeCard as RecipeCardType } from '@chefmate/shared';

const COMMON_INGREDIENTS = [
  'Chicken', 'Eggs', 'Onion', 'Tomato', 'Garlic', 'Ginger',
  'Potato', 'Rice', 'Pasta', 'Lemon', 'Coriander', 'Cumin',
];

export default function FridgePage() {
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeCardType[]>([]);
  const [activeTab, setActiveTab] = useState<'type' | 'camera'>('type');

  const addIngredient = (ing: string) => {
    const trimmed = ing.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInput('');
  };

  const removeIngredient = (ing: string) =>
    setIngredients((prev) => prev.filter((i) => i !== ing));

  const fridgeMutation = useMutation({
    mutationFn: async (ings: string[]) => {
      const res = await api.post('/fridge/recipes', { ingredients: ings });
      return res.data.recipes as RecipeCardType[];
    },
    onSuccess: (data) => setRecipes(data),
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(input);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Fridge to Table 🧊
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Tell me what you have — I'll find recipes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Ingredient input method">
        {(['type', 'camera'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'var(--color-gold)' : 'var(--color-bg)',
              color: activeTab === tab ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {tab === 'camera' && <Camera size={14} />}
            {tab === 'type' ? 'Type' : 'Camera'}
          </button>
        ))}
      </div>

      {activeTab === 'type' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Input */}
          <div className="flex gap-2">
            <WarmInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type ingredient + Enter (e.g. chicken)"
              className="flex-1"
            />
            <WarmButton onClick={() => addIngredient(input)} disabled={!input.trim()} size="sm">
              Add
            </WarmButton>
          </div>

          {/* Quick add common ingredients */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_INGREDIENTS.filter((i) => !ingredients.includes(i)).map((ing) => (
                <Chip
                  key={ing}
                  label={ing}
                  onClick={() => addIngredient(ing)}
                />
              ))}
            </div>
          </div>

          {/* Selected ingredients */}
          {ingredients.length > 0 && (
            <div
              className="rounded-2xl p-4 glass-card"
            >
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Ingredients in your fridge ({ingredients.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {ingredients.map((ing) => (
                    <motion.div
                      key={ing}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Chip
                        label={ing}
                        selected
                        onRemove={() => removeIngredient(ing)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {ingredients.length >= 2 && (
            <WarmButton
              className="w-full"
              variant="gold"
              disabled={fridgeMutation.isPending}
              onClick={() => fridgeMutation.mutate(ingredients)}
            >
              <ChefHat size={16} className="mr-2" />
              {fridgeMutation.isPending ? 'ChefMate is thinking...' : `Find Recipes (${ingredients.length} ingredients)`}
            </WarmButton>
          )}
          {ingredients.length === 1 && (
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              Add at least 2 ingredients to find recipes
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-8"
        >
          <div
            className="w-64 h-48 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed glass-card"
            style={{ borderColor: 'rgba(212,168,83,0.3)' }}
          >
            <Camera size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Camera scan coming soon!
            </p>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            📷 Take a photo of your fridge and ChefMate will detect ingredients automatically
          </p>
          <WarmButton variant="ghost" onClick={() => setActiveTab('type')}>
            Type ingredients instead →
          </WarmButton>
        </motion.div>
      )}

      {/* Results */}
      {fridgeMutation.isPending && (
        <div className="flex flex-col items-center gap-4 py-8">
          <ChefMateAvatar state="cooking" size="md" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            ChefMate is cooking up ideas...
          </p>
        </div>
      )}

      {recipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Recipes with your ingredients 🍳
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </motion.div>
      )}

      {fridgeMutation.isError && (
        <div
          className="rounded-2xl p-4 text-sm glass-card"
          style={{ color: 'var(--color-primary-dark)' }}
        >
          Oops! ChefMate had trouble finding recipes. Try again in a moment! ☕
        </div>
      )}
    </div>
  );
}
