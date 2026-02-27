'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Plus } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { AIBubble } from '@/components/molecules/ChatBubble/AIBubble';
import { UserBubble } from '@/components/molecules/ChatBubble/UserBubble';
import { TypingIndicator } from '@/components/molecules/ChatBubble/TypingIndicator';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { WarmButton } from '@/components/atoms/WarmButton';
import { cn } from '@/lib/cn';

const QUICK_REPLIES = [
  "What can I make with chicken?",
  "Give me a healthy breakfast idea",
  "I'm feeling stressed — comfort food?",
  "Show me a 15-minute recipe",
];

export default function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming, startNewConversation } = useChat();
  const avatarState = useUIStore((s) => s.avatarState);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border-light)' }}
      >
        <div className="flex items-center gap-3">
          <ChefMateAvatar state={avatarState} size="sm" />
          <div>
            <h1 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              ChefMate AI
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-success)' }}>
              🟢 Online · Cozy Kitchen Mode
            </p>
          </div>
        </div>
        <button
          onClick={startNewConversation}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {!hasMessages && (
            <motion.div
              className="flex flex-col items-center justify-center h-full gap-6 text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChefMateAvatar state="happy" size="xl" />
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  Good to see you! 👋
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ask me anything about cooking, nutrition, or how you're feeling.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-left text-sm px-4 py-3 rounded-2xl transition-all duration-150 hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)]"
                    style={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((message) =>
            message.role === 'user' ? (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                <UserBubble content={message.content} timestamp={message.createdAt} />
              </motion.div>
            ) : (
              <motion.div key={message.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} layout>
                <AIBubble
                  content={message.content}
                  recipes={message.recipes}
                  isStreaming={message.isStreaming}
                  timestamp={message.isStreaming ? undefined : message.createdAt}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        className="shrink-0 border-t px-4 py-3"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border-light)' }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl border px-4 py-2 transition-all"
          style={{
            background: 'var(--color-bg)',
            border: '1.5px solid var(--color-border-mid)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ChefMate anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
            style={{ color: 'var(--color-text)', maxHeight: '120px', lineHeight: '1.5' }}
            aria-label="Chat message input"
          />

          {/* Voice button */}
          <button
            onClick={toggleVoice}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
              isListening
                ? 'bg-[var(--color-error)] text-white animate-pulse'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
            )}
            aria-label={isListening ? 'Stop recording' : 'Start voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-error)', color: 'white' }}
              aria-label="Stop generating"
            >
              ■
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105 disabled:opacity-40"
              style={{ background: input.trim() ? 'var(--gradient-sunrise)' : 'var(--color-border-light)', color: 'white' }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
