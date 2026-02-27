import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@chefmate/shared';

interface UserState {
  preferences: UserPreferences | null;
  streak: { current: number; longest: number } | null;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  setStreak: (streak: { current: number; longest: number }) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: null,
      streak: null,

      setPreferences: (preferences) => set({ preferences }),

      updatePreferences: (partial) =>
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...partial }
            : null,
        })),

      setStreak: (streak) => set({ streak }),
    }),
    {
      name: 'chefmate-user',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
