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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setApiError('');
    try {
      const res = await api.post<AuthResponse>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      storeToken(res.data.token);
      setAuth(res.data.user, res.data.token, false);
      router.push('/onboarding');
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
        Join ChefMate! 🎉
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Your cooking journey starts here
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
          label="Your name"
          type="text"
          placeholder="Priya"
          error={errors.name?.message}
          {...register('name')}
        />

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
            placeholder="Min 8 characters"
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

        <WarmInput
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <WarmButton type="submit" variant="gold" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </WarmButton>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </>
  );
}
