'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { RecipeCard } from '@/components/molecules/RecipeCard';
import { Chip } from '@/components/atoms/Chip';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import api from '@/lib/api';
import type { RecipeCard as RecipeCardType } from '@chefmate/shared';

const CUISINES = ['All', 'Indian', 'Italian', 'Mexican', 'Mediterranean', 'Asian', 'American'];
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showGenerator, setShowGenerator] = useState(false);
  const [genIngredients, setGenIngredients] = useState<string[]>([]);
  const [genInput, setGenInput] = useState('');

  const { data, isLoading } = useQuery<{ recipes: RecipeCardType[]; total: number }>({
    queryKey: ['recipes', selectedCuisine, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCuisine !== 'All') params.set('cuisine', selectedCuisine.toLowerCase());
      if (selectedDifficulty !== 'All') params.set('difficulty', selectedDifficulty);
      const res = await api.get(`/recipes?${params}`);
      return res.data;
    },
  });

  const { data: searchData, isFetching: isSearching } = useQuery<{ recipes: RecipeCardType[] }>({
    queryKey: ['recipes', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { recipes: [] };
      const res = await api.get(`/recipes/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data;
    },
    enabled: searchQuery.trim().length > 2,
  });

  const generateMutation = useMutation({
    mutationFn: async (ingredients: string[]) => {
      const res = await api.post('/recipes/generate', { ingredients });
      return res.data.recipe as RecipeCardType;
    },
  });

  const displayedRecipes = searchQuery.trim().length > 2
    ? (searchData?.recipes || [])
    : (data?.recipes || []);

  const addGenIngredient = (ing: string) => {
    const trimmed = ing.trim();
    if (trimmed && !genIngredients.includes(trimmed)) {
      setGenIngredients((prev) => [...prev, trimmed]);
    }
    setGenInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Recipes 📖
        </h1>
        <WarmButton size="sm" variant="gold" onClick={() => setShowGenerator(!showGenerator)}>
          <Sparkles size={14} className="mr-1" />
          AI Generate
        </WarmButton>
      </div>

      {/* AI Recipe Generator */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-3xl overflow-hidden glass-card"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    AI Recipe Generator
                  </h2>
                </div>
                <button onClick={() => setShowGenerator(false)} aria-label="Close AI generator">
                  <X size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                </button>
              </div>

              <div className="flex gap-2">
                <WarmInput
                  value={genInput}
                  onChange={(e) => setGenInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGenIngredient(genInput); } }}
                  placeholder="Add ingredients (Enter to add)"
                  className="flex-1"
                />
                <WarmButton size="sm" onClick={() => addGenIngredient(genInput)} disabled={!genInput.trim()}>
                  Add
                </WarmButton>
              </div>

              {genIngredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {genIngredients.map((ing) => (
                      <motion.div
                        key={ing}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Chip
                          label={ing}
                          selected
                          onRemove={() => setGenIngredients((prev) => prev.filter((i) => i !== ing))}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <WarmButton
                className="w-full"
                variant="gold"
                disabled={genIngredients.length < 2 || generateMutation.isPending}
                onClick={() => generateMutation.mutate(genIngredients)}
              >
                {generateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <ChefMateAvatar state="thinking" size="sm" />
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Recipe'
                )}
              </WarmButton>

              {generateMutation.data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <RecipeCard recipe={generateMutation.data} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm outline-none border"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              borderColor: 'rgba(212,168,83,0.2)',
            }}
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search recipes"
          />
        </div>

        {/* Filters */}
        {!searchQuery && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CUISINES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={selectedCuisine === c}
                  onClick={() => setSelectedCuisine(c)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  label={d.charAt(0).toUpperCase() + d.slice(1)}
                  selected={selectedDifficulty === d}
                  onClick={() => setSelectedDifficulty(d)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recipe Grid */}
      {isLoading || isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden skeleton"
              style={{ height: '220px' }}
            />
          ))}
        </div>
      ) : displayedRecipes.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {displayedRecipes.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12">
          <ChefMateAvatar state="idle" size="md" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {searchQuery ? `No recipes found for "${searchQuery}"` : 'No recipes yet! Try AI generating one ✨'}
          </p>
        </div>
      )}
    </div>
  );
}
