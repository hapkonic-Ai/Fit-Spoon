import Anthropic from '@anthropic-ai/sdk';
import { Errors } from '../../lib/errors.js';
import { AI_MODEL } from '../../lib/constants.js';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  timeout: 60_000,
});

export { AI_MODEL };

// Retry wrapper with exponential backoff for non-streaming calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on auth errors
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw Errors.aiError();
      }

      // Rate limit from Anthropic — wait and retry
      if (lastError.message.includes('429') && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[AI] Rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  console.error('[AI] All retries exhausted:', lastError?.message);
  throw Errors.aiError();
}
