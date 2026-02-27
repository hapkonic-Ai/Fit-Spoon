export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  dietaryType: DietaryType;
  allergies: string[];
  cuisines: string[];
  skillLevel: SkillLevel;
  calorieGoal: number;
  proteinGoal: number | null;
  carbGoal: number | null;
  fatGoal: number | null;
  language: string;
  theme: AppTheme;
  aiPersonality: AIPersonality;
}

export type DietaryType =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'flexitarian'
  | 'keto'
  | 'paleo';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'chef';

export type AppTheme = 'warm-light' | 'cozy-dark' | 'soft-pastel';

export type AIPersonality = 'warm' | 'professional' | 'playful';

export type HealthGoal =
  | 'lose-weight'
  | 'build-muscle'
  | 'eat-healthier'
  | 'enjoy-food'
  | 'manage-health'
  | 'maintain';

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

export interface UserAchievement extends Achievement {
  earnedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfile {
  user: User;
  preferences: UserPreferences;
}
