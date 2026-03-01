'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { WarmButton } from '@/components/atoms/WarmButton';
import api from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import type { AppTheme, DietaryType, SkillLevel } from '@chefmate/shared';

const THEMES: { value: AppTheme; label: string; preview: string }[] = [
  { value: 'warm-light', label: 'Warm Light', preview: '#FFF4E6' },
  { value: 'cozy-dark', label: 'Cozy Dark', preview: '#1A1410' },
  { value: 'soft-pastel', label: 'Soft Pastel', preview: '#F8F4FF' },
];

const DIETARY_OPTIONS: { value: DietaryType; label: string }[] = [
  { value: 'omnivore', label: '🍖 Omnivore' },
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'pescatarian', label: '🐟 Pescatarian' },
  { value: 'keto', label: '🥑 Keto' },
  { value: 'paleo', label: '🥩 Paleo' },
];

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: '🌱 Beginner' },
  { value: 'intermediate', label: '🍳 Intermediate' },
  { value: 'advanced', label: '👨‍🍳 Advanced' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useUIStore();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/user/profile');
      return res.data;
    },
  });

  const [calorieGoal, setCalorieGoal] = useState<number>(data?.preferences?.calorieGoal || 2000);
  const [dietary, setDietary] = useState<DietaryType>(data?.preferences?.dietaryType || 'omnivore');
  const [skill, setSkill] = useState<SkillLevel>(data?.preferences?.skillLevel || 'intermediate');

  const prefMutation = useMutation({
    mutationFn: () => api.put('/user/preferences', { dietaryType: dietary, skillLevel: skill, calorieGoal, theme }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const handleLogout = () => {
    removeToken();
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1
        className="text-2xl font-bold luxury-text"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Settings ⚙️
      </h1>

      {/* Theme */}
      <motion.div
        className="glass-card luxury-border rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>App Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all"
              style={{
                background: t.preview,
                borderColor: theme === t.value ? 'var(--color-gold)' : 'var(--color-border-light)',
                boxShadow: theme === t.value ? 'var(--shadow-luxury)' : 'none',
              }}
            >
              <span className="text-xs font-medium" style={{ color: '#3A2D28' }}>{t.label}</span>
              {theme === t.value && (
                <span className="text-xs" style={{ color: 'var(--color-gold)' }}>✓ Active</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        className="glass-card luxury-border rounded-3xl p-6 space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Food Preferences</h2>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Dietary Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDietary(opt.value)}
                className="py-2 px-3 rounded-xl text-xs font-medium text-left transition-all border"
                style={{
                  background: dietary === opt.value ? 'rgba(212,168,83,0.15)' : 'var(--color-bg)',
                  color: dietary === opt.value ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  borderColor: dietary === opt.value ? 'var(--color-gold)' : 'var(--color-border-light)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Skill Level
          </label>
          <div className="flex gap-2">
            {SKILL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSkill(opt.value)}
                className="flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all border"
                style={{
                  background: skill === opt.value ? 'rgba(212,168,83,0.15)' : 'var(--color-bg)',
                  color: skill === opt.value ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  borderColor: skill === opt.value ? 'var(--color-gold)' : 'var(--color-border-light)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Daily Calorie Goal: {calorieGoal} kcal
          </label>
          <input
            type="range"
            min={800}
            max={4000}
            step={50}
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)]"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>800</span><span>4000</span>
          </div>
        </div>

        <WarmButton
          className="w-full"
          disabled={prefMutation.isPending}
          onClick={() => prefMutation.mutate()}
        >
          {saved ? '✓ Saved!' : prefMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </WarmButton>
      </motion.div>

      {/* Logout */}
      <motion.div
        className="glass-card luxury-border rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Account</h2>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all border"
          style={{
            background: 'transparent',
            color: 'var(--color-error)',
            borderColor: 'var(--color-error)',
          }}
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
