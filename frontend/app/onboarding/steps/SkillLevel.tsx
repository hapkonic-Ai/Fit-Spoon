'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WarmButton } from '@/components/atoms/WarmButton';

const SKILL_LEVELS = [
  {
    key: 'beginner',
    label: 'Beginner',
    emoji: '🌱',
    description: 'Just starting out — I need simple, foolproof recipes',
  },
  {
    key: 'intermediate',
    label: 'Home Cook',
    emoji: '🍳',
    description: 'Comfortable in the kitchen — ready for more variety',
  },
  {
    key: 'advanced',
    label: 'Experienced',
    emoji: '👨‍🍳',
    description: 'I love experimenting with complex techniques',
  },
];

interface SkillLevelProps {
  onNext: (data: { skillLevel: string }) => void;
  defaultValues?: { skillLevel?: string };
}

export function SkillLevel({ onNext, defaultValues }: SkillLevelProps) {
  const [selected, setSelected] = useState(defaultValues?.skillLevel || '');

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
        Your cooking skill level? 👨‍🍳
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
        I'll tailor recipe complexity just for you
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {SKILL_LEVELS.map((level) => (
          <button
            key={level.key}
            onClick={() => setSelected(level.key)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all border"
            style={{
              background: selected === level.key ? 'var(--color-primary-light)' : 'var(--color-bg)',
              borderColor: selected === level.key ? 'var(--color-primary)' : 'var(--color-border-light)',
              boxShadow: selected === level.key ? 'var(--shadow-glow)' : 'none',
            }}
          >
            <span className="text-3xl">{level.emoji}</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {level.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {level.description}
              </p>
            </div>
            {selected === level.key && (
              <div
                className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <WarmButton
        className="w-full"
        disabled={!selected}
        onClick={() => onNext({ skillLevel: selected })}
      >
        Continue →
      </WarmButton>
    </motion.div>
  );
}
