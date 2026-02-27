import { create } from 'zustand';
import type { RecipeCard } from '@chefmate/shared';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipes?: RecipeCard[];
  quickReplies?: string[];
  isStreaming?: boolean;
  createdAt: Date;
}

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  currentMood: string | null;
  addMessage: (message: ChatMessage) => void;
  appendToLastMessage: (delta: string) => void;
  addRecipeToLastMessage: (recipe: RecipeCard) => void;
  setStreaming: (streaming: boolean) => void;
  finishStreaming: (conversationId: string) => void;
  setMood: (mood: string) => void;
  clearChat: () => void;
  startNewConversation: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  isStreaming: false,
  currentMood: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToLastMessage: (delta) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.isStreaming) {
        msgs[msgs.length - 1] = { ...last, content: last.content + delta };
      }
      return { messages: msgs };
    }),

  addRecipeToLastMessage: (recipe) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = {
          ...last,
          recipes: [...(last.recipes ?? []), recipe],
        };
      }
      return { messages: msgs };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  finishStreaming: (conversationId) =>
    set((state) => {
      const msgs = state.messages.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      );
      return { messages: msgs, isStreaming: false, conversationId };
    }),

  setMood: (mood) => set({ currentMood: mood }),

  clearChat: () => set({ messages: [], conversationId: null }),

  startNewConversation: () =>
    set({ messages: [], conversationId: null, isStreaming: false }),
}));
