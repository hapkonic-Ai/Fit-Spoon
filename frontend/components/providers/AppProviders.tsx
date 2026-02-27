'use client';

import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUIStore } from '@/stores/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function ThemeApplier() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme === 'warm-light' ? '' : theme);
  }, [theme]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '16px',
            fontFamily: 'var(--font-body)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
