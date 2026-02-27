'use client';

import { motion } from 'framer-motion';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { WarmButton } from '@/components/atoms/WarmButton';

interface WelcomeProps {
  onNext: () => void;
  userName?: string;
}

export function Welcome({ onNext, userName }: WelcomeProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ChefMateAvatar state="celebrating" size="xl" />

      <div>
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Welcome{userName ? `, ${userName}` : ''}! 🎉
        </h2>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          I'm ChefMate, your personal AI cooking companion. I'll help you discover
          amazing recipes, track your nutrition, and make cooking a joyful experience.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[
          { icon: '🍳', label: 'Cook smarter' },
          { icon: '🥗', label: 'Eat better' },
          { icon: '✨', label: 'Feel great' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-primary-dark)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <WarmButton onClick={onNext} className="w-full mt-2">
        Let's get started →
      </WarmButton>
    </motion.div>
  );
}
