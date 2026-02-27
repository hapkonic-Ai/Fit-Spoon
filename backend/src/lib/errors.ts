export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly warmMessage: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  // Auth
  emailTaken: () =>
    new AppError(
      'EMAIL_TAKEN',
      'Email already registered',
      409,
      "That email is already cooking with us! Try logging in instead. 🍳"
    ),

  invalidCredentials: () =>
    new AppError(
      'INVALID_CREDENTIALS',
      'Invalid email or password',
      401,
      "Hmm, that password doesn't seem right. Double-check and try again! 🔑"
    ),

  unauthorized: () =>
    new AppError(
      'UNAUTHORIZED',
      'No valid authentication token',
      401,
      "I need to know it's you first! Please log in again. 🔐"
    ),

  tokenExpired: () =>
    new AppError(
      'TOKEN_EXPIRED',
      'Authentication token expired',
      401,
      "Your session ended while we were cooking! Please log in again. ⏰"
    ),

  // Resources
  notFound: (resource: string = 'resource') =>
    new AppError(
      'NOT_FOUND',
      `${resource} not found`,
      404,
      `Hmm, I couldn't find that ${resource}. Let's search together! 🔍`
    ),

  // Rate limiting
  rateLimited: (retryAfterSecs: number) =>
    new AppError(
      'RATE_LIMITED',
      'Rate limit exceeded',
      429,
      `ChefMate needs a tiny breather! ☕ Try again in ${retryAfterSecs} seconds.`
    ),

  // AI
  aiError: () =>
    new AppError(
      'AI_ERROR',
      'AI service error',
      503,
      "Oops, my thinking cap fell off! 🍳 Let me try that again in a moment."
    ),

  aiUnavailable: () =>
    new AppError(
      'AI_UNAVAILABLE',
      'AI service is unavailable',
      503,
      "ChefMate's brain is taking a quick nap! 😴 Please try again in a few minutes."
    ),

  aiQueueFull: () =>
    new AppError(
      'AI_QUEUE_FULL',
      'AI request queue is full',
      503,
      "The kitchen is busy right now! 👨‍🍳 Please wait a moment and try again."
    ),

  // Validation
  validation: (message: string) =>
    new AppError(
      'VALIDATION_ERROR',
      message,
      400,
      `Hmm, that doesn't look quite right — ${message}`
    ),

  // Server
  internal: () =>
    new AppError(
      'INTERNAL_ERROR',
      'Internal server error',
      500,
      "Something got burned in the kitchen! 🔥 We're fixing it now."
    ),
} as const;
