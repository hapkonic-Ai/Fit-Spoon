'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import api from '@/lib/api';

const CHEF_TIPS = [
  { tip: "Always taste as you cook — your palate is your best ingredient!", emoji: "👨‍🍳" },
  { tip: "Salt pasta water generously — it should taste like the sea.", emoji: "🍝" },
  { tip: "Let meat rest before cutting — keeps all those delicious juices in.", emoji: "🥩" },
  { tip: "Room-temperature eggs make fluffier omelettes every time.", emoji: "🥚" },
  { tip: "A squeeze of lemon brightens almost any dish instantly.", emoji: "🍋" },
  { tip: "High heat for searing, low heat for braising. Know your temperatures!", emoji: "🔥" },
  { tip: "Fresh herbs added at the end preserve their vibrant flavour.", emoji: "🌿" },
];

const CHALLENGES = [
  { title: "Cook at Home 5 Days", progress: 3, total: 5, icon: "🏠", reward: "50 pts" },
  { title: "Try 3 New Cuisines", progress: 1, total: 3, icon: "🌍", reward: "75 pts" },
  { title: "Log Meals Daily", progress: 5, total: 7, icon: "📓", reward: "30 pts" },
  { title: "Drink 8 Glasses/Day", progress: 4, total: 7, icon: "💧", reward: "25 pts" },
];

const MOTIVATIONAL_QUOTES = [
  { quote: "One recipe at a time, one healthy day at a time.", author: "ChefMate" },
  { quote: "Cooking is an act of love for yourself and others.", author: "Jacques Pépin" },
  { quote: "The secret ingredient is always you.", author: "ChefMate" },
];

export default function MotivationPage() {
  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await api.get('/user/streak');
      return res.data as { current: number; longest: number; lastActiveDate: string };
    },
  });

  const { data: achievementsData } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await api.get('/user/achievements');
      return res.data as { achievements: Array<{ key: string; title: string; icon: string; earnedAt: string }> };
    },
  });

  const todayTip = CHEF_TIPS[new Date().getDate() % CHEF_TIPS.length];
  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  const streakDays = streakData?.current || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Daily Motivation ✨
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Your cooking journey, one day at a time
        </p>
      </div>

      {/* Daily Quote Card */}
      <motion.div
        className="relative rounded-3xl p-6 overflow-hidden"
        style={{ background: 'var(--gradient-sunrise)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <ChefMateAvatar state="happy" size="xl" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wider mb-3 text-white/70">
          Today's Inspiration
        </p>
        <p className="text-xl font-bold text-white leading-snug mb-2">
          "{todayQuote.quote}"
        </p>
        <p className="text-sm text-white/80">— {todayQuote.author}</p>
      </motion.div>

      {/* Streak */}
      <motion.div
        className="rounded-3xl p-6"
        style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Your Streak 🔥</h2>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Best: {streakData?.longest || 0} days
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
            {streakDays}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {streakDays === 1 ? 'Day' : 'Days'} in a row!
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {streakDays >= 7 ? "You're on fire! Keep it up! 🔥" :
               streakDays >= 3 ? "Great momentum! Don't stop now!" :
               "Every day is a fresh start 🌅"}
            </p>
          </div>
        </div>

        {/* Streak dots */}
        <div className="flex gap-1.5 mt-4 flex-wrap" role="list" aria-label="Last 7 days streak">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
              style={{
                background: i < streakDays ? 'var(--color-primary)' : 'var(--color-bg)',
                color: i < streakDays ? 'white' : 'var(--color-text-muted)',
              }}
              role="listitem"
              aria-label={i < streakDays ? `Day ${i + 1}: active` : `Day ${i + 1}: not active`}
            >
              <span aria-hidden="true">{i < streakDays ? '🔥' : '○'}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chef Tip */}
      <motion.div
        className="rounded-3xl p-5"
        style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-primary)' }}>
          Chef Tip of the Day {todayTip.emoji}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {todayTip.tip}
        </p>
      </motion.div>

      {/* Wellness Challenges */}
      <motion.div
        className="rounded-3xl p-6"
        style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Weekly Challenges 🎯
        </h2>
        <div className="space-y-4">
          {CHALLENGES.map((challenge) => {
            const percent = (challenge.progress / challenge.total) * 100;
            return (
              <div key={challenge.title}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{challenge.icon}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {challenge.title}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {challenge.progress}/{challenge.total} · {challenge.reward}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-border-light)' }}
                  role="progressbar"
                  aria-valuenow={challenge.progress}
                  aria-valuemax={challenge.total}
                  aria-label={`${challenge.title}: ${challenge.progress} of ${challenge.total}`}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--gradient-sunrise)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Achievements */}
      {achievementsData?.achievements && achievementsData.achievements.length > 0 && (
        <motion.div
          className="rounded-3xl p-6"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Your Achievements 🏆
          </h2>
          <div className="flex flex-wrap gap-3">
            {achievementsData.achievements.map((a) => (
              <div
                key={a.key}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--color-primary-light)' }}
              >
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary-dark)' }}>
                  {a.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
