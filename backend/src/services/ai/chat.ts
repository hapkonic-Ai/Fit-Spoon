import { model } from './client.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { aiQueue } from '../../lib/queue.js';
import { Errors } from '../../lib/errors.js';
import type { Content } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name: string;
  dietary?: string;
  allergies?: string[];
  cuisines?: string[];
  skillLevel?: string;
  healthGoal?: string;
  currentMood?: string;
}

// Parses recipe tags from AI response text
function parseRecipeTags(text: string): {
  cleanText: string;
  recipes: Record<string, unknown>[];
} {
  const recipes: Record<string, unknown>[] = [];
  const cleanText = text.replace(/<recipe>(.*?)<\/recipe>/gs, (_, json) => {
    try {
      recipes.push(JSON.parse(json));
    } catch {
      // ignore malformed recipe JSON
    }
    return ''; // remove from text
  });
  return { cleanText: cleanText.trim(), recipes };
}

// Convert our chat history to Gemini's Content format
function toGeminiHistory(history: ChatMessage[]): Content[] {
  return history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

export async function streamChatResponse(
  userMessage: string,
  history: ChatMessage[],
  userContext: UserContext,
  onChunk: (event: object) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  const systemPrompt = buildSystemPrompt(userContext);

  // Use last 20 messages for context
  const recentHistory = history.slice(-20);

  try {
    await aiQueue.add(async () => {
      let fullText = '';

      const chat = model.startChat({
        history: toGeminiHistory(recentHistory),
        systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
      });

      const result = await chat.sendMessageStream(userMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
          onChunk({ type: 'text', delta: text });
        }
      }

      // Parse recipe tags from complete response
      const { recipes } = parseRecipeTags(fullText);
      for (const recipe of recipes) {
        onChunk({ type: 'recipe', data: recipe });
      }

      onDone();
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('RATE_LIMITED')) {
      onError(err);
      return;
    }
    console.error('[AI Chat Error]', err);
    onError(Errors.aiError());
  }
}
