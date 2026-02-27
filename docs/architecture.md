# ChefMate AI — Architecture

## System Overview

```
Browser / Mobile App
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js 15 Frontend (Port 3000)   │
│  - App Router (RSC + Client)       │
│  - Tailwind CSS + Framer Motion    │
│  - Zustand + TanStack Query        │
└──────────────┬──────────────────────┘
               │ REST + SSE
               ▼
┌─────────────────────────────────────┐
│  Hono Backend (Port 3001)          │
│  - JWT Auth middleware             │
│  - Token-bucket Rate Limiter       │
│  - Request Queue (max 3 AI calls)  │
│  - Drizzle ORM                     │
└──┬────────────────────┬────────────┘
   │                    │
   ▼                    ▼
Neon PostgreSQL    Anthropic Claude API
(Database)         (claude-sonnet-4-6)
```

## Key Architectural Decisions

### 1. SSE over WebSockets for Chat
- Simpler to implement and scale
- One-way streaming (server → client) is all we need
- Better firewall/proxy compatibility
- Native browser support (EventSource API)

### 2. Token-Bucket Rate Limiting (in-memory)
- Per-user rate limiting prevents API overuse
- In-memory is sufficient for single-server MVP
- Upgrade path: swap to Upstash Redis for multi-server

### 3. Request Queue for AI Calls
- Max 3 concurrent Claude API calls per server
- Prevents 429s from Anthropic rate limits
- FIFO queue with 30s timeout
- Frontend shows optimistic UI while queued

### 4. JWT Auth (jose library)
- No external auth service dependency
- Stateless — scales horizontally
- 7-day expiry + refresh token endpoint
- Stored in localStorage (httpOnly cookie option for v2)

### 5. Drizzle ORM + Neon PostgreSQL
- Type-safe database queries
- Neon serverless = no connection management
- Drizzle migrations for schema changes

### 6. Monorepo (pnpm workspaces)
- Shared types package prevents drift
- Independent deployability
- Single `pnpm dev` starts everything

## Data Flow — Chat Request

```
User types message
       │
       ▼
InputBar.tsx → useChat.ts hook
       │
       ▼
api.stream('/chat/message', payload)  ← stream.ts utility
       │
       ▼ [SSE connection opens]
Hono: POST /api/chat/message
       │
       ├─ Auth middleware (JWT verify)
       ├─ Rate limit check (20/min for chat)
       ├─ Add to AI request queue
       │
       ▼
systemPrompt.ts builds personalized prompt
       │
       ▼
Anthropic SDK stream (claude-sonnet-4-6)
       │
       ▼ [tokens stream back]
Parse: text chunks → send as SSE data events
Parse: JSON recipe blocks → send as type:"recipe" events
       │
       ▼ [done]
Save full message to conversations/messages tables
Send type:"done" SSE event
       │
       ▼ [frontend]
useChat.ts appends each delta to messages state
Avatar: idle → listening → thinking → talking
Recipe card rendered inline on type:"recipe"
```

## Deployment Architecture (MVP)

```
GitHub Repository
       │
       ├─ frontend/ → Vercel (automatic deploys)
       │
       └─ backend/  → Railway (Docker or Node)
                         │
                    Neon PostgreSQL (cloud)
                    Anthropic API (external)
```
