'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--gradient-dark-luxury)' }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'var(--color-primary)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'var(--color-gold)' }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <ChefMateAvatar state="happy" size="lg" />
          <h1
            className="text-3xl font-bold mt-4 mb-1 luxury-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ChefMate AI
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-gold-light)' }}>
            Your warm kitchen companion 🍳
          </p>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-glass), var(--shadow-xl)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
