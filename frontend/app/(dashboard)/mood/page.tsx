'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { RecipeCard } from '@/components/molecules/RecipeCard';
import { WarmButton } from '@/components/atoms/WarmButton';
import api from '@/lib/api';
import { MOOD_CONFIG } from '@chefmate/shared';
import type { Mood, RecipeCard as RecipeCardType } from '@chefmate/shared';

const MOODS: Mood[] = ['happy', 'calm', 'stressed', 'tired', 'celebratory', 'sad', 'motivated', 'unwell'];

interface MoodResponse {
  entry: { mood: Mood };
  recommendations: {
    recipes: RecipeCardType[];
    tip: string;
  };
}

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<MoodResponse | null>(null);

  const moodMutation = useMutation({
    mutationFn: async (payload: { mood: Mood; note: string }) => {
      const res = await api.post<MoodResponse>('/mood/log', payload);
      return res.data;
    },
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = () => {
    if (!selectedMood) return;
    moodMutation.mutate({ mood: selectedMood, note });
  };

  const config = selectedMood ? MOOD_CONFIG[selectedMood] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold luxury-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          How are you feeling? 💭
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Tell me your mood — I'll suggest the perfect comfort food
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Avatar reflects mood */}
            <div className="flex justify-center">
              <ChefMateAvatar
                state={selectedMood === 'happy' || selectedMood === 'celebratory' || selectedMood === 'motivated' ? 'happy' :
                  selectedMood === 'stressed' || selectedMood === 'sad' || selectedMood === 'unwell' ? 'empathy' :
                  'idle'}
                size="lg"
              />
            </div>

            {/* Mood grid */}
            <div className="grid grid-cols-4 gap-3">
              {MOODS.map((mood) => {
                const mc = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;
                return (
                  <motion.button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${isSelected ? 'luxury-border' : 'glass-card'}`}
                    style={{
                      ...(isSelected ? {
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--glass-blur))',
                        boxShadow: '0 0 0 3px rgba(212,168,83,0.3), var(--shadow-glass)',
                        borderColor: 'var(--color-gold)',
                      } : {}),
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={isSelected}
                    aria-label={`Mood: ${mc.label}`}
                  >
                    <span className="text-2xl">{mc.emoji}</span>
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: isSelected ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
                    >
                      {mood}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected mood info */}
            {config && selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card luxury-border rounded-2xl p-4"
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>
                  {config.emoji} {config.label}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  "{config.foodPhilosophy}"
                </p>
              </motion.div>
            )}

            {/* Optional note */}
            {selectedMood && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional — what's on your mind?)"
                  rows={2}
                  className="glass-card w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                  style={{
                    color: 'var(--color-text)',
                  }}
                  aria-label="Optional note about your mood"
                />
              </motion.div>
            )}

            <WarmButton
              className="w-full"
              disabled={!selectedMood || moodMutation.isPending}
              onClick={handleSubmit}
            >
              {moodMutation.isPending ? 'Finding comfort food...' : 'Get Food Recommendations →'}
            </WarmButton>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <ChefMateAvatar state="happy" size="lg" />
            </div>

            <div
              className="glass-card luxury-border rounded-2xl p-5"
            >
              <p className="text-sm font-medium mb-1 luxury-text">
                ChefMate's tip for you:
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {result.recommendations.tip}
              </p>
            </div>

            {result.recommendations.recipes?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  Perfect recipes for your mood 🍽️
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.recommendations.recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            <WarmButton
              variant="ghost"
              className="w-full"
              onClick={() => { setResult(null); setSelectedMood(null); setNote(''); }}
            >
              Check mood again
            </WarmButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
