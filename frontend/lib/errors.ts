export interface ApiError {
  error: string;
  warmMessage: string;
  retryAfter?: number;
  details?: string;
}

export class ChefMateError extends Error {
  constructor(
    public readonly code: string,
    public readonly warmMessage: string,
    public readonly statusCode: number,
    public readonly retryAfter?: number
  ) {
    super(warmMessage);
    this.name = 'ChefMateError';
  }
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'warmMessage' in err;
}

export function getWarmMessage(err: unknown): string {
  if (err instanceof ChefMateError) return err.warmMessage;
  if (isApiError(err)) return err.warmMessage;
  if (err instanceof Error) return err.message;
  return "Something got burned in the kitchen! 🔥 Please try again.";
}

export const WARM_MESSAGES = {
  network: "Looks like we lost our WiFi noodle! 🍜 Check your connection.",
  timeout: "ChefMate is taking a moment to think... ☕ Please try again.",
  rateLimit: (secs: number) => `ChefMate needs a tiny breather! ☕ Try again in ${secs} seconds.`,
  generic: "Something got burned in the kitchen! 🔥 We're fixing it now.",
} as const;
