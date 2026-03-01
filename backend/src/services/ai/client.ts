import { GoogleGenerativeAI } from '@google/generative-ai';
import { Errors } from '../../lib/errors.js';
import { AI_MODEL } from '../../lib/constants.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[AI] GEMINI_API_KEY not set — AI features will fail');
}

export const genAI = new GoogleGenerativeAI(apiKey ?? '');
export const model = genAI.getGenerativeModel({ model: AI_MODEL });

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
      if (lastError.message.includes('API_KEY') || lastError.message.includes('403')) {
        throw Errors.aiError();
      }

      // Rate limit — wait and retry
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
