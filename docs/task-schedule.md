# ChefMate AI — Task Schedule

> Updated as tasks are completed. Mark with [x] when done.

## Phase 1 — Project Scaffolding
- [x] Init pnpm monorepo (package.json, pnpm-workspace.yaml)
- [x] Create docs/ folder with context.md, task-schedule.md
- [x] Create packages/shared with all shared TypeScript types
- [x] Bootstrap Next.js 15 frontend with TypeScript + Tailwind CSS
- [x] Bootstrap Hono backend with TypeScript
- [x] Configure Drizzle ORM
- [x] Set up .env files from .env.example
- [x] Install all dependencies

## Phase 2 — Design System & Core UI
- [x] Write CSS design tokens (globals.css — all CSS vars)
- [x] Configure Tailwind with warm color palette
- [x] Set up shadcn/ui with warm theme customization
- [x] Build WarmButton atom component
- [x] Build WarmInput atom component
- [x] Build Chip atom component
- [x] Build ProgressRing atom component (SVG donut)
- [x] Build MacroBar atom component
- [x] Build ThemeProvider (Light/Dark/Pastel)
- [x] Build AppProviders wrapper

## Phase 3 — Backend Core
- [x] Database schema (all 12 tables in schema.ts)
- [x] Drizzle-kit push to create tables
- [x] POST /api/auth/signup route
- [x] POST /api/auth/login route
- [x] POST /api/auth/refresh route
- [x] JWT auth middleware (jose)
- [x] Token-bucket rate limiting middleware
- [x] Global error handler (warm messages)
- [x] CORS middleware
- [x] GET/PUT /api/user/profile routes
- [x] GET/PUT /api/user/preferences routes
- [x] GET /api/user/streak route
- [x] GET /api/user/achievements route

## Phase 4 — AI Integration
- [x] Anthropic SDK client setup (client.ts)
- [x] Retry logic (3 retries, exponential backoff)
- [x] System prompt builder (user-personalized)
- [x] SSE streaming chat endpoint (POST /api/chat/message)
- [x] Request queue (max 3 concurrent AI calls)
- [x] GET /api/chat/history/:convId route
- [x] POST /api/recipes/generate (structured JSON from Claude)
- [x] POST /api/recipes/from-fridge (ingredient-based)

## Phase 5 — Frontend Shell
- [x] Auth pages (login/signup with warm design)
- [x] Onboarding flow (6 steps: Welcome, BasicInfo, Dietary, Cuisine, Skill, Complete)
- [x] Dashboard layout (sidebar desktop + bottom nav mobile)
- [x] TopBar with greeting
- [x] FloatingChatButton (FAB, bottom right)
- [x] axios API client (interceptors: auth header, 429 retry, error transform)
- [x] SSE streaming client (stream.ts)
- [x] All Zustand stores (auth, chat, user, nutrition, recipe, ui)
- [x] TanStack Query setup

## Phase 6 — Home Dashboard (Module 1)
- [x] DashboardHero (greeting, avatar, mood row)
- [x] QuickActions horizontal scroll section
- [x] Daily stats cards (streak, calories, recipes cooked)
- [x] Suggested recipes horizontal scroll (TanStack Query)
- [x] Stagger-fade-in load animations (Framer Motion)

## Phase 7 — Avatar + Chat (Modules 2 & 3)
- [x] ChefMateAvatar SVG component (all 6 states: idle, thinking, happy, cooking, empathy, listening)
- [x] useAvatarState state machine hook
- [x] Idle breathing animation (Framer Motion)
- [x] Eye blink animation
- [x] Happy bounce animation
- [x] ChatWindow with virtualized MessageList
- [x] AIBubble component (warm cream, tail bottom-left)
- [x] UserBubble component (sunrise gradient, tail bottom-right)
- [x] TypingIndicator (3-dot sequential bounce)
- [x] InputBar (text + voice toggle)
- [x] VoiceInput (Web Speech API recording UI)
- [x] useChat hook with SSE streaming
- [x] Recipe cards embedded in chat (RecipeCardChat variant)
- [x] Quick reply chips

## Phase 8 — Recipes Module (Module 4)
- [x] Recipe browser page with category pills
- [x] RecipeCard component (image, title, time, calories, difficulty)
- [x] RecipeCardSkeleton loading state
- [x] AI recipe generation UI (ingredient chips + generate button + shimmer)
- [x] Recipe detail page (hero image, tabs: Ingredients/Instructions/Nutrition/Tips)
- [x] Save/unsave recipe (heart button)
- [x] Cooking mode page (step-by-step, screen-on, voice nav)
- [x] GET /api/recipes, GET /api/recipes/:id routes
- [x] GET /api/recipes/search, GET /api/recipes/saved routes
- [x] POST /api/recipes/:id/save route

## Phase 9 — Nutrition + Fridge (Modules 5 & 6)
- [x] Calorie ring (animated SVG donut, draws on mount)
- [x] MacroBar (animated fill, protein/carbs/fat/fiber)
- [x] Water intake tracker (glass icon grid, tap to fill)
- [x] Meal log timeline (breakfast/lunch/snack/dinner)
- [x] Meal log entry form
- [x] Weekly bar chart (Recharts, warm orange bars)
- [x] ChefMate nutrition insight card
- [x] GET/POST /api/nutrition/today, /api/nutrition/log routes
- [x] POST /api/nutrition/water route
- [x] Fridge ingredient input page (type / voice tabs)
- [x] Ingredient tag chips (add / remove with animation)
- [x] Camera scan UI (show viewfinder placeholder)
- [x] POST /api/fridge/recipes route
- [x] Recipe results from fridge

## Phase 10 — Mood + Motivation + Profile (Modules 7, 8, 9)
- [x] Mood selector pill grid (8 moods with emoji)
- [x] Mood-to-food recommendation display
- [x] POST /api/mood/log route
- [x] Daily motivation card (sunrise gradient animation)
- [x] 7-day streak display (dot calendar)
- [x] Achievement unlock (confetti + avatar clap)
- [x] Chef tip of the day card
- [x] Wellness challenge progress bars
- [x] Onboarding profile form (React Hook Form + Zod)
- [x] Profile edit page
- [x] Settings panel (theme, goals, notifications, privacy)

## Phase 11 — Advanced Features
- [x] Smart grocery list (grouped by category, share/copy)
- [ ] POST /api/grocery/generate route (AI-powered from meal plan)
- [ ] Weekly health dashboard (full chart set)
- [ ] Recipe collections (saved, cooked history)
- [ ] AI meal planner (7-day grid)
- [x] Cooking mode voice navigation ("next step" command)

## Phase 12 — Polish & QA
- [x] FloatingChatButton added to dashboard layout
- [x] All loading skeletons reviewed
- [x] All error states with warm messages tested
- [ ] Empty states with avatar illustrations — in progress
- [x] Accessibility: skip-to-main link added
- [x] Accessibility: ARIA labels on interactive elements
- [x] Accessibility: focus-visible rings (globals.css)
- [x] prefers-reduced-motion CSS added (globals.css)
- [ ] Mobile QA (375px, 390px, 428px widths)
- [ ] Desktop QA (1280px, 1440px widths)
- [ ] Rate limit smoke test (25 rapid messages → retry toast)
- [ ] Full user journey E2E test
- [ ] Theme switching QA (Light → Dark → Pastel)
