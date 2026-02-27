'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';
import api from '@/lib/api';
import { setToken as storeToken } from '@/lib/auth';
import type { AuthResponse } from '@chefmate/shared';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      storeToken(res.data.token);
      setAuth(res.data.user, res.data.token, res.data.user.onboardingComplete);

      if (!res.data.user.onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as { warmMessage?: string; message?: string };
      setApiError(error.warmMessage || error.message || 'Something went wrong. Please try again!');
    }
  };

  return (
    <>
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Welcome back! 👋
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Let's get cooking again
      </p>

      {apiError && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-primary)' }}
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <WarmInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <WarmInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <WarmButton type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </WarmButton>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
        New to ChefMate?{' '}
        <Link href="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Create account
        </Link>
      </p>
    </>
  );
}
