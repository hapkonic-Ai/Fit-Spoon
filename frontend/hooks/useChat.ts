'use client';

import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { streamChat } from '@/lib/stream';
import { toast } from 'sonner';

export function useChat() {
  const {
    messages,
    conversationId,
    isStreaming,
    addMessage,
    appendToLastMessage,
    addRecipeToLastMessage,
    setStreaming,
    finishStreaming,
    startNewConversation,
  } = useChatStore();

  const { setAvatarState, resetAvatarToIdle } = useUIStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: { mood?: string; ingredients?: string[] }) => {
      if (isStreaming || !content.trim()) return;

      // Add user message
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      });

      // Add placeholder AI message (streaming)
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        isStreaming: true,
        createdAt: new Date(),
      });

      setStreaming(true);
      setAvatarState('listening');

      // After a brief delay, switch to thinking
      const thinkTimeout = setTimeout(() => setAvatarState('thinking'), 500);

      // Create abort controller for this request
      abortRef.current = new AbortController();

      let finalConversationId = conversationId;

      await streamChat(
        {
          message: content.trim(),
          conversationId,
          context,
        },
        {
          signal: abortRef.current.signal,
          onEvent: (event) => {
            if (event.type === 'text') {
              appendToLastMessage(event.delta);
              // Switch avatar to talking when first token arrives
              setAvatarState('happy');
            } else if (event.type === 'recipe') {
              addRecipeToLastMessage(event.data);
            } else if (event.type === 'done') {
              finalConversationId = event.conversationId;
            } else if (event.type === 'error') {
              toast.error(event.warmMessage);
            }
          },
          onError: (err) => {
            clearTimeout(thinkTimeout);
            setStreaming(false);
            resetAvatarToIdle();
            if (err.name !== 'AbortError') {
              toast.error(err.message || "Something went wrong. Let's try again! 🍳");
            }
          },
        }
      );

      clearTimeout(thinkTimeout);
      finishStreaming(finalConversationId ?? '');
      setTimeout(resetAvatarToIdle, 2000);
    },
    [
      isStreaming,
      conversationId,
      addMessage,
      appendToLastMessage,
      addRecipeToLastMessage,
      setStreaming,
      finishStreaming,
      setAvatarState,
      resetAvatarToIdle,
    ]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    resetAvatarToIdle();
  }, [setStreaming, resetAvatarToIdle]);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    startNewConversation,
  };
}
