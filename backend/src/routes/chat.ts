import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { conversations, messages, users, userPreferences } from '../db/schema.js';
import { streamChatResponse } from '../services/ai/chat.js';
import { chatSchema } from '../lib/validation.js';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = new Hono();

// POST /chat/message — SSE streaming
router.post(
  '/message',
  authMiddleware,
  rateLimitMiddleware('AI_CHAT'),
  zValidator('json', chatSchema),
  async (c) => {
    const userId = c.get('userId');
    const { message, conversationId, context } = c.req.valid('json');

    // Fetch user context for system prompt
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw Errors.unauthorized();

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const [conv] = await db
        .insert(conversations)
        .values({ userId, title: message.slice(0, 60) })
        .returning({ id: conversations.id });
      convId = conv.id;
    }

    // Fetch last 20 messages for context
    const history = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt))
      .limit(20);

    // Save user message
    await db.insert(messages).values({
      conversationId: convId,
      role: 'user',
      content: message,
    });

    // Set SSE headers
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Accel-Buffering', 'no');

    let fullAssistantText = '';
    const embeddedRecipes: object[] = [];

    return c.stream(async (stream) => {
      const sendEvent = async (data: object) => {
        await stream.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      await streamChatResponse(
        message,
        history as { role: 'user' | 'assistant'; content: string }[],
        {
          name: user.name,
          dietary: prefs?.dietaryType ?? 'omnivore',
          allergies: prefs?.allergies ?? [],
          cuisines: prefs?.cuisines ?? [],
          skillLevel: prefs?.skillLevel ?? 'beginner',
          healthGoal: prefs?.healthGoal ?? 'eat-healthier',
          currentMood: context?.mood,
        },
        async (event) => {
          const evt = event as { type: string; delta?: string; data?: object };
          if (evt.type === 'text' && evt.delta) {
            fullAssistantText += evt.delta;
          }
          if (evt.type === 'recipe' && evt.data) {
            embeddedRecipes.push(evt.data);
          }
          await sendEvent(event);
        },
        async () => {
          // Save assistant message to DB
          await db.insert(messages).values({
            conversationId: convId!,
            role: 'assistant',
            content: fullAssistantText,
            metadata: embeddedRecipes.length > 0 ? { recipes: embeddedRecipes } : undefined,
          });

          await sendEvent({ type: 'done', conversationId: convId });
        },
        async (err) => {
          await sendEvent({
            type: 'error',
            message: err.message,
            warmMessage: 'Oops, my thinking cap fell off! 🍳 Please try again.',
          });
        }
      );
    });
  }
);

// GET /chat/history/:conversationId
router.get('/history/:conversationId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { conversationId } = c.req.param();

  const [conv] = await db
    .select({ id: conversations.id, userId: conversations.userId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv || conv.userId !== userId) {
    throw Errors.notFound('conversation');
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return c.json({ messages: msgs });
});

// DELETE /chat/:conversationId
router.delete('/:conversationId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { conversationId } = c.req.param();

  const [conv] = await db
    .select({ id: conversations.id, userId: conversations.userId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv || conv.userId !== userId) throw Errors.notFound('conversation');

  await db.delete(conversations).where(eq(conversations.id, conversationId));
  return c.json({ success: true });
});

export default router;
