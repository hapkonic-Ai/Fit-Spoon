import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@chefmate/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setAuth: (user: User, token: string, onboardingComplete: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  setOnboardingComplete: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingComplete: false,

      setAuth: (user, token, onboardingComplete) =>
        set({ user, token, isAuthenticated: true, onboardingComplete }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      setOnboardingComplete: () => set({ onboardingComplete: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, onboardingComplete: false }),
    }),
    {
      name: 'chefmate-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);
