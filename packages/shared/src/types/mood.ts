import type { RecipeCard } from './recipe';

export type Mood =
  | 'happy'
  | 'stressed'
  | 'tired'
  | 'unwell'
  | 'celebratory'
  | 'sad'
  | 'motivated'
  | 'calm';

export interface MoodConfig {
  key: Mood;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  foodPhilosophy: string;
}

export const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  happy: {
    key: 'happy',
    label: 'Happy & Energetic',
    emoji: '😊',
    color: '#FFD166',
    bgColor: '#FFF9E6',
    foodPhilosophy: 'Light, colorful, fresh. Celebrate with vibrant flavors.',
  },
  stressed: {
    key: 'stressed',
    label: 'Stressed',
    emoji: '😰',
    color: '#EF476F',
    bgColor: '#FFE5EC',
    foodPhilosophy: 'Warm, comforting, familiar. Simplicity is healing.',
  },
  tired: {
    key: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: '#A8763E',
    bgColor: '#FFF0E0',
    foodPhilosophy: 'Iron-rich, energizing. Foods that restore vitality.',
  },
  unwell: {
    key: 'unwell',
    label: 'Not Well',
    emoji: '🤒',
    color: '#52B788',
    bgColor: '#E8F8EE',
    foodPhilosophy: 'Gentle, healing. Anti-inflammatory, easy to digest.',
  },
  celebratory: {
    key: 'celebratory',
    label: 'Celebratory!',
    emoji: '🥳',
    color: '#FF8C42',
    bgColor: '#FFF0E5',
    foodPhilosophy: 'Indulgent, special. This moment deserves something wonderful.',
  },
  sad: {
    key: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: '#90E0EF',
    bgColor: '#E8F7FB',
    foodPhilosophy: 'Hug-in-a-bowl comfort. Warm, rich, cozy.',
  },
  motivated: {
    key: 'motivated',
    label: 'Motivated',
    emoji: '💪',
    color: '#FF8C42',
    bgColor: '#FFF0E5',
    foodPhilosophy: 'High-protein, powerful. Fuel the fire within.',
  },
  calm: {
    key: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: '#D4A373',
    bgColor: '#FAF3EA',
    foodPhilosophy: 'Nourishing, balanced. Mindful eating at its best.',
  },
};

export interface MoodLog {
  id: string;
  userId: string;
  mood: Mood;
  note?: string;
  loggedAt: string;
}

export interface MoodRecommendation {
  entry: MoodLog;
  recommendations: {
    recipes: RecipeCard[];
    tip: string;
    moodMessage: string;
  };
}

export interface MoodLogRequest {
  mood: Mood;
  note?: string;
}

export interface MoodHistory {
  date: string;
  mood: Mood;
}
