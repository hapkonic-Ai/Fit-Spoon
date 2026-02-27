import type { RecipeCard } from './recipe';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface MessageMetadata {
  recipes?: RecipeCard[];
  quickReplies?: string[];
  type?: 'recipe' | 'tips' | 'nutrition' | 'motivation';
}

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string | null;
  context?: ChatContext;
}

export interface ChatContext {
  mood?: string;
  ingredients?: string[];
}

// SSE event types from backend
export interface SSETextEvent {
  type: 'text';
  delta: string;
}

export interface SSERecipeEvent {
  type: 'recipe';
  data: RecipeCard;
}

export interface SSEDoneEvent {
  type: 'done';
  conversationId: string;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
  warmMessage: string;
}

export type SSEEvent = SSETextEvent | SSERecipeEvent | SSEDoneEvent | SSEErrorEvent;

// Frontend chat state
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  recipes?: RecipeCard[];
  quickReplies?: string[];
  isStreaming?: boolean;
  createdAt: Date;
}
