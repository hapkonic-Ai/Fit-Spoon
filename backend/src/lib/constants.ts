export const AI_MODEL = 'claude-sonnet-4-6' as const;

export const RATE_LIMITS = {
  AI_CHAT: {
    tokens: Number(process.env.RATE_LIMIT_AI_CHAT ?? 20),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  },
  AI_GENERATE: {
    tokens: Number(process.env.RATE_LIMIT_AI_GENERATE ?? 10),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  },
  GENERAL: {
    tokens: Number(process.env.RATE_LIMIT_GENERAL ?? 100),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  },
  AUTH: {
    tokens: 10,
    windowMs: 60_000,
  },
} as const;

export const AI_QUEUE = {
  MAX_CONCURRENT: 3,
  TIMEOUT_MS: 30_000,
} as const;

export const JWT = {
  ALGORITHM: 'HS256' as const,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
};

export const WATER_GLASSES_GOAL = 8;

export const ACHIEVEMENTS = [
  { key: 'first_recipe', title: 'First Recipe!', description: 'Cooked your first recipe', icon: '🍳', points: 10 },
  { key: 'first_mood', title: 'Mood Matcher', description: 'Used mood-based recommendations', icon: '🌈', points: 10 },
  { key: 'hydration_hero', title: 'Hydration Hero', description: 'Logged 8 glasses of water', icon: '💧', points: 15 },
  { key: 'streak_3', title: '3-Day Streak', description: 'Cooked 3 days in a row', icon: '🔥', points: 20 },
  { key: 'streak_7', title: 'Week Warrior', description: 'Cooked 7 days in a row', icon: '⚡', points: 50 },
  { key: 'streak_30', title: 'Monthly Master', description: 'Cooked 30 days in a row', icon: '🏆', points: 200 },
  { key: 'fridge_wizard', title: 'Fridge Wizard', description: 'Generated recipe from fridge', icon: '🧊', points: 20 },
  { key: 'saved_10', title: 'Recipe Collector', description: 'Saved 10 recipes', icon: '📚', points: 30 },
  { key: 'cultural_explorer', title: 'Cultural Explorer', description: 'Tried 5 different cuisines', icon: '🌍', points: 40 },
  { key: 'macro_master', title: 'Macro Master', description: 'Hit all macro goals in a day', icon: '💪', points: 35 },
] as const;

export const MOOD_FOOD_MAP: Record<string, string[]> = {
  happy: ['salad', 'smoothie', 'fresh fruit bowl', 'colorful grain bowl'],
  stressed: ['warm soup', 'chamomile oats', 'golden milk', 'banana bread', 'dark chocolate mousse'],
  tired: ['iron-rich spinach dal', 'energy balls', 'lentil soup', 'egg curry'],
  unwell: ['ginger turmeric soup', 'congee', 'clear broth', 'honey lemon tea'],
  celebratory: ['special pasta', 'celebration cake', 'fancy cocktail mocktail', 'gourmet pizza'],
  sad: ['mac and cheese', 'warm chicken soup', 'grilled cheese', 'hot chocolate pudding'],
  motivated: ['high-protein chicken', 'quinoa power bowl', 'egg white omelette', 'tuna salad'],
  calm: ['meditation bowl', 'herbed rice', 'avocado toast', 'green smoothie'],
};
