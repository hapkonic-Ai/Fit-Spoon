'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/user/profile');
      return res.data;
    },
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await api.get('/user/streak');
      return res.data as { current: number; longest: number };
    },
  });

  const profileMutation = useMutation({
    mutationFn: (payload: ProfileForm) => api.put('/user/profile', payload),
    onSuccess: (res) => {
      if (user) updateUser({ name: res.data.user?.name || user.name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const preferences = data?.preferences;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Profile 👤
      </h1>

      {/* Avatar card */}
      <motion.div
        className="rounded-3xl p-6 flex flex-col items-center gap-4"
        style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ChefMateAvatar state="happy" size="xl" />
        <div className="text-center">
          <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div
            className="rounded-2xl p-3 text-center"
            style={{ background: 'var(--color-bg)' }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {streakData?.current || 0}🔥
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Current Streak</p>
          </div>
          <div
            className="rounded-2xl p-3 text-center"
            style={{ background: 'var(--color-bg)' }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>
              {streakData?.longest || 0}⭐
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Best Streak</p>
          </div>
        </div>
      </motion.div>

      {/* Edit profile */}
      <motion.div
        className="rounded-3xl p-6"
        style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
          <WarmInput
            label="Display name"
            type="text"
            error={errors.name?.message}
            {...register('name')}
          />
          <WarmInput
            label="Email"
            type="email"
            value={user?.email || ''}
            disabled
          />
          <WarmButton
            type="submit"
            className="w-full"
            disabled={!isDirty || profileMutation.isPending}
          >
            {saved ? '✓ Saved!' : profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </WarmButton>
        </form>
      </motion.div>

      {/* Preferences summary */}
      {preferences && (
        <motion.div
          className="rounded-3xl p-6"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Food Preferences
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Diet', value: preferences.dietaryType?.replace('_', '-') || 'omnivore' },
              { label: 'Skill', value: preferences.skillLevel || 'intermediate' },
              { label: 'Calorie Goal', value: `${preferences.calorieGoal || 2000} kcal/day` },
              { label: 'Allergies', value: preferences.allergies?.join(', ') || 'None' },
              { label: 'Cuisines', value: preferences.cuisines?.join(', ') || 'All' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-2 border-b last:border-0"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
