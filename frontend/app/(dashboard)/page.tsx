'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { useUIStore } from '@/stores/uiStore';
import { WarmButton } from '@/components/atoms/WarmButton';
import { RecipeCard, RecipeCardSkeleton } from '@/components/molecules/RecipeCard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Flame, Zap, BookOpen, Droplets } from 'lucide-react';
import { useNutritionStore } from '@/stores/nutritionStore';
import { useNutritionToday } from '@/hooks/useNutrition';
import type { RecipeCard as RecipeCardType, RecipeListResponse } from '@chefmate/shared';

const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'stressed', emoji: '😰', label: 'Stressed' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'motivated', emoji: '💪', label: 'Motivated' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const avatarState = useUIStore((s) => s.avatarState);
  const setAvatarState = useUIStore((s) => s.setAvatarState);
  const { todayCalories, calorieGoal, waterGlasses } = useNutritionStore();
  const { greeting, emoji } = { greeting: getGreeting().text, emoji: getGreeting().emoji };

  // Fetch today's nutrition
  useNutritionToday();

  // Fetch suggested recipes
  const { data: recipesData, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', 'suggested'],
    queryFn: async () => {
      const { data } = await api.get<RecipeListResponse>('/recipes?limit=6');
      return data;
    },
  });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
  };

  return (
    <div className="max-w-2xl lg:max-w-none mx-auto px-4 pt-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* Hero — Greeting + Avatar */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-warm)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {greeting} {emoji}
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {user?.name ? `Hey, ${user.name.split(' ')[0]}!` : 'Welcome back!'}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                What shall we cook today?
              </p>
            </div>
            <ChefMateAvatar state={avatarState} size="lg" />
          </div>
        </motion.div>

        {/* Mood Check-in */}
        <motion.div variants={itemVariants}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
            🌡️ How are you feeling right now?
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MOODS.map((mood) => (
              <Link
                key={mood.key}
                href={`/mood?selected=${mood.key}`}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105 shrink-0"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {mood.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {[
              { href: '/recipes', icon: '🍳', label: 'Recipes' },
              { href: '/fridge', icon: '🧊', label: 'Fridge' },
              { href: '/nutrition', icon: '📊', label: 'Nutrition' },
              { href: '/chat', icon: '💬', label: 'Chat' },
              { href: '/mood', icon: '🌈', label: 'Mood' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Today's Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-3 gap-3" role="list" aria-label="Today's stats">
            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
              role="listitem"
              aria-label={`Calories: ${todayCalories} of ${calorieGoal}`}
            >
              <Flame size={20} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }} aria-hidden="true">
                {todayCalories}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">
                / {calorieGoal} kcal
              </span>
            </div>
            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
              role="listitem"
              aria-label={`Water: ${waterGlasses} of 8 glasses`}
            >
              <Droplets size={20} style={{ color: '#90E0EF' }} aria-hidden="true" />
              <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }} aria-hidden="true">
                {waterGlasses}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">
                / 8 glasses
              </span>
            </div>
            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
              role="listitem"
              aria-label="Current streak: 0 days"
            >
              <Zap size={20} style={{ color: 'var(--color-secondary)' }} aria-hidden="true" />
              <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }} aria-hidden="true">0</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">day streak</span>
            </div>
          </div>
        </motion.div>

        {/* Suggested Recipes */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              ✨ Suggested for You
            </h2>
            <Link href="/recipes" className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {recipesLoading
              ? Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
              : (recipesData?.recipes ?? []).map((recipe: RecipeCardType) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl}
                    cuisine={recipe.cuisine}
                    difficulty={recipe.difficulty}
                    prepTimeMins={recipe.prepTimeMins}
                    calories={recipe.calories}
                    dietaryTags={recipe.dietaryTags}
                  />
                ))}
          </div>
        </motion.div>

        {/* ChefMate CTA */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border-light)' }}
        >
          <ChefMateAvatar state="happy" size="md" />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              I'm here to help! 💕
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Ask me anything about cooking, nutrition, or wellness
            </p>
          </div>
          <Link href="/chat">
            <WarmButton size="sm">Chat</WarmButton>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
