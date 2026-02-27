import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AvatarState = 'idle' | 'thinking' | 'happy' | 'cooking' | 'empathy' | 'listening' | 'celebrating';
export type AppTheme = 'warm-light' | 'cozy-dark' | 'soft-pastel';

interface UIState {
  theme: AppTheme;
  avatarState: AvatarState;
  isMobileMenuOpen: boolean;
  isChatOpen: boolean;
  setTheme: (theme: AppTheme) => void;
  setAvatarState: (state: AvatarState) => void;
  resetAvatarToIdle: () => void;
  toggleMobileMenu: () => void;
  openChat: () => void;
  closeChat: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'warm-light',
      avatarState: 'idle',
      isMobileMenuOpen: false,
      isChatOpen: false,

      setTheme: (theme) => {
        set({ theme });
        // Apply to DOM
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme === 'warm-light' ? '' : theme);
        }
      },

      setAvatarState: (avatarState) => set({ avatarState }),

      resetAvatarToIdle: () => set({ avatarState: 'idle' }),

      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
    }),
    {
      name: 'chefmate-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
