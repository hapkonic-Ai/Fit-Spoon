import axios, { AxiosError, type AxiosInstance } from 'axios';
import { getToken, setToken, removeToken } from './auth';
import { ChefMateError } from './errors';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle errors + 429 retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error: string; warmMessage: string; retryAfter?: number }>) => {
    const config = error.config as typeof error.config & { _retryCount?: number };
    const status = error.response?.status;
    const data = error.response?.data;

    // 401 — Clear token and redirect to login
    if (status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ChefMateError('UNAUTHORIZED', data?.warmMessage ?? "Please log in again.", 401);
    }

    // 429 — Rate limited: wait and retry once
    if (status === 429) {
      const retryAfter = data?.retryAfter ?? 30;
      config._retryCount = (config._retryCount ?? 0) + 1;

      if (config._retryCount <= 2) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return api(config);
      }

      throw new ChefMateError(
        'RATE_LIMITED',
        data?.warmMessage ?? `ChefMate needs a breather! ☕ Try again in ${retryAfter}s.`,
        429,
        retryAfter
      );
    }

    // Network errors
    if (!error.response) {
      throw new ChefMateError(
        'NETWORK_ERROR',
        "Looks like we lost our WiFi noodle! 🍜 Check your connection.",
        0
      );
    }

    // Other API errors
    throw new ChefMateError(
      data?.error ?? 'API_ERROR',
      data?.warmMessage ?? "Something got burned in the kitchen! 🔥 Please try again.",
      status ?? 500,
      data?.retryAfter
    );
  }
);

export default api;

// Token refresh helper
export async function refreshAuth() {
  try {
    const { data } = await api.post<{ token: string }>('/auth/refresh');
    setToken(data.token);
    return data.token;
  } catch {
    removeToken();
    return null;
  }
}
