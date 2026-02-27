'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ChefMate Error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-4">🔥</div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Something got burned!
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Don't worry — even the best chefs have kitchen accidents. Let's try that again!
        </p>

        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl font-medium text-sm transition-all hover:scale-105"
          style={{ background: 'var(--gradient-sunrise)', color: 'white' }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
