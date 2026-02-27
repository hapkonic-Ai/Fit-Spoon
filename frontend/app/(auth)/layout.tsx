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
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <ChefMateAvatar state="happy" size="lg" />
          <h1
            className="text-3xl font-bold mt-4 mb-1"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            ChefMate AI
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Your warm kitchen companion 🍳
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-xl"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-xl)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
