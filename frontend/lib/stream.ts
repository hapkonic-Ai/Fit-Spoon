import { getToken } from './auth';
import type { RecipeCard } from '@chefmate/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export type StreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'recipe'; data: RecipeCard }
  | { type: 'done'; conversationId: string }
  | { type: 'error'; message: string; warmMessage: string };

interface StreamOptions {
  onEvent: (event: StreamEvent) => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

export async function streamChat(
  payload: {
    message: string;
    conversationId?: string | null;
    context?: { mood?: string; ingredients?: string[] };
  },
  { onEvent, onError, signal }: StreamOptions
): Promise<void> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Network error'));
    return;
  }

  if (!response.ok) {
    let errorData: { warmMessage?: string } = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    onError?.(new Error(errorData.warmMessage ?? 'Stream request failed'));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError?.(new Error('No response body'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const event = JSON.parse(jsonStr) as StreamEvent;
            onEvent(event);
          } catch {
            // ignore malformed event
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      onError?.(err instanceof Error ? err : new Error('Stream read error'));
    }
  } finally {
    reader.releaseLock();
  }
}
