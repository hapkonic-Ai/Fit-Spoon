'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { setToken, removeToken } from '@/lib/auth';
import type { User } from '@chefmate/shared';

interface LoginData { email: string; password: string }
interface SignupData { email: string; name: string; password: string }
interface AuthResponse { token: string; user: User & { onboardingComplete: boolean } }

export function useAuth() {
  const { user, isAuthenticated, onboardingComplete, setAuth, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const login = useCallback(async (data: LoginData) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    setToken(res.data.token);
    setAuth(res.data.user, res.data.token, res.data.user.onboardingComplete ?? false);

    if (res.data.user.onboardingComplete) {
      router.push('/');
    } else {
      router.push('/onboarding');
    }
  }, [setAuth, router]);

  const signup = useCallback(async (data: SignupData) => {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    setToken(res.data.token);
    setAuth(res.data.user, res.data.token, false);
    router.push('/onboarding');
  }, [setAuth, router]);

  const logout = useCallback(() => {
    removeToken();
    storeLogout();
    router.push('/login');
    toast.success("See you next time! 👨‍🍳");
  }, [storeLogout, router]);

  return { user, isAuthenticated, onboardingComplete, login, signup, logout };
}
