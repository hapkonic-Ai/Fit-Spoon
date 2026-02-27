'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WarmButton } from '@/components/atoms/WarmButton';

const CUISINES = [
  { key: 'indian', label: 'Indian', emoji: '🫕' },
  { key: 'italian', label: 'Italian', emoji: '🍝' },
  { key: 'mexican', label: 'Mexican', emoji: '🌮' },
  { key: 'mediterranean', label: 'Mediterranean', emoji: '🫙' },
  { key: 'chinese', label: 'Chinese', emoji: '🥟' },
  { key: 'japanese', label: 'Japanese', emoji: '🍱' },
  { key: 'thai', label: 'Thai', emoji: '🍜' },
  { key: 'american', label: 'American', emoji: '🍔' },
  { key: 'french', label: 'French', emoji: '🥐' },
  { key: 'korean', label: 'Korean', emoji: '🥘' },
  { key: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' },
  { key: 'fusion', label: 'Fusion', emoji: '🌏' },
];

interface CuisinePrefsProps {
  onNext: (data: { cuisines: string[] }) => void;
  defaultValues?: { cuisines?: string[] };
}

export function CuisinePrefs({ onNext, defaultValues }: CuisinePrefsProps) {
  const [selected, setSelected] = useState<string[]>(defaultValues?.cuisines || []);

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        What cuisines do you love? 🌍
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
        Pick as many as you like — I'll mix them up for you
      </p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {CUISINES.map((c) => (
          <button
            key={c.key}
            onClick={() => toggle(c.key)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all border"
            style={{
              background: selected.includes(c.key) ? 'var(--color-primary)' : 'var(--color-bg)',
              color: selected.includes(c.key) ? 'white' : 'var(--color-text)',
              borderColor: selected.includes(c.key) ? 'var(--color-primary)' : 'var(--color-border-light)',
            }}
          >
            <span className="text-2xl">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      <WarmButton
        className="w-full"
        disabled={selected.length === 0}
        onClick={() => onNext({ cuisines: selected })}
      >
        Continue →
      </WarmButton>
      {selected.length === 0 && (
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Select at least one cuisine
        </p>
      )}
    </motion.div>
  );
}
