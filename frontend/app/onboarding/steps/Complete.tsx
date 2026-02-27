'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { WarmButton } from '@/components/atoms/WarmButton';

interface CompleteProps {
  userName?: string;
}

export function Complete({ userName }: CompleteProps) {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate after 4 seconds
    const timer = setTimeout(() => router.push('/'), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <motion.div
      className="flex flex-col items-center text-center gap-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.4 }}
    >
      <ChefMateAvatar state="celebrating" size="xl" />

      <div>
        <motion.h2
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You're all set{userName ? `, ${userName}` : ''}! 🎉
        </motion.h2>
        <motion.p
          className="text-base"
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ChefMate is ready to cook with you. Let's discover amazing recipes together!
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-2 w-full text-left"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {[
          '✅ Personalized recipes based on your preferences',
          '✅ AI cooking assistant available 24/7',
          '✅ Nutrition tracking tailored to your goals',
          '✅ Mood-based meal recommendations',
        ].map((item) => (
          <p key={item} className="text-sm py-2 px-4 rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
            {item}
          </p>
        ))}
      </motion.div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <WarmButton className="w-full" onClick={() => router.push('/')}>
          Enter ChefMate →
        </WarmButton>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Taking you to your dashboard automatically...
        </p>
      </motion.div>
    </motion.div>
  );
}
