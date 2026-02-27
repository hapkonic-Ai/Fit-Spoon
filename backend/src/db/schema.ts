import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  date,
  primaryKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── USERS ────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  onboardingComplete: boolean('onboarding_complete').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── USER PREFERENCES ─────────────────────────────────────────────
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  dietaryType: text('dietary_type').default('omnivore'),
  allergies: text('allergies').array().default([]),
  cuisines: text('cuisines').array().default([]),
  skillLevel: text('skill_level').default('beginner'),
  healthGoal: text('health_goal').default('eat-healthier'),
  calorieGoal: integer('calorie_goal').default(2000),
  proteinGoal: integer('protein_goal'),
  carbGoal: integer('carb_goal'),
  fatGoal: integer('fat_goal'),
  language: text('language').default('en'),
  theme: text('theme').default('warm-light'),
  aiPersonality: text('ai_personality').default('warm'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── RECIPES ──────────────────────────────────────────────────────
export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  cuisine: text('cuisine').notNull().default('international'),
  mealType: text('meal_type').array().default([]),
  dietaryTags: text('dietary_tags').array().default([]),
  difficulty: text('difficulty').notNull().default('easy'),
  prepTimeMins: integer('prep_time_mins').notNull().default(15),
  cookTimeMins: integer('cook_time_mins').notNull().default(0),
  servings: integer('servings').notNull().default(2),
  calories: integer('calories').notNull().default(0),
  proteinG: decimal('protein_g', { precision: 6, scale: 1 }).default('0'),
  carbsG: decimal('carbs_g', { precision: 6, scale: 1 }).default('0'),
  fatG: decimal('fat_g', { precision: 6, scale: 1 }).default('0'),
  fiberG: decimal('fiber_g', { precision: 6, scale: 1 }).default('0'),
  ingredients: jsonb('ingredients').default([]),
  steps: jsonb('steps').default([]),
  aiGenerated: boolean('ai_generated').default(false),
  chefNote: text('chef_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── SAVED RECIPES ────────────────────────────────────────────────
export const savedRecipes = pgTable(
  'saved_recipes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
    notes: text('notes'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.recipeId] })]
);

// ─── NUTRITION LOGS ───────────────────────────────────────────────
export const nutritionLogs = pgTable('nutrition_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  mealType: text('meal_type').notNull(),
  recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'set null' }),
  mealName: text('meal_name').notNull(),
  calories: integer('calories').notNull().default(0),
  proteinG: decimal('protein_g', { precision: 6, scale: 1 }).default('0'),
  carbsG: decimal('carbs_g', { precision: 6, scale: 1 }).default('0'),
  fatG: decimal('fat_g', { precision: 6, scale: 1 }).default('0'),
  loggedAt: timestamp('logged_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── WATER LOGS ───────────────────────────────────────────────────
export const waterLogs = pgTable('water_logs', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  glasses: integer('glasses').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
},
(t) => [primaryKey({ columns: [t.userId, t.date] })]
);

// ─── MOOD LOGS ────────────────────────────────────────────────────
export const moodLogs = pgTable('mood_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mood: text('mood').notNull(),
  note: text('note'),
  loggedAt: timestamp('logged_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── CONVERSATIONS ────────────────────────────────────────────────
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── MESSAGES ─────────────────────────────────────────────────────
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── STREAKS ──────────────────────────────────────────────────────
export const streaks = pgTable('streaks', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActiveDate: date('last_active_date'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  points: integer('points').default(10),
});

// ─── USER ACHIEVEMENTS ────────────────────────────────────────────
export const userAchievements = pgTable(
  'user_achievements',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: uuid('achievement_id')
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })]
);

// ─── RELATIONS ────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  streak: one(streaks, { fields: [users.id], references: [streaks.userId] }),
  savedRecipes: many(savedRecipes),
  nutritionLogs: many(nutritionLogs),
  moodLogs: many(moodLogs),
  conversations: many(conversations),
  achievements: many(userAchievements),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
