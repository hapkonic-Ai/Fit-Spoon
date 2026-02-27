import { anthropic, AI_MODEL } from './client.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { aiQueue } from '../../lib/queue.js';
import { Errors } from '../../lib/errors.js';

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

export async function streamChatResponse(
  userMessage: string,
  history: ChatMessage[],
  userContext: UserContext,
  onChunk: (event: object) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  const systemPrompt = buildSystemPrompt(userContext);

  // Build messages array (last 20 messages to stay within context)
  const messages: ChatMessage[] = [
    ...history.slice(-20),
    { role: 'user', content: userMessage },
  ];

  try {
    await aiQueue.add(async () => {
      let fullText = '';

      const stream = await anthropic.messages.stream({
        model: AI_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
          onChunk({ type: 'text', delta: chunk.delta.text });
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
