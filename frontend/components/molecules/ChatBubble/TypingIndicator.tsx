'use client';

import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <ChefMateAvatar state="thinking" size="sm" />
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-[4px_20px_20px_20px]"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid rgba(255,140,66,0.15)',
          boxShadow: 'var(--shadow-sm)',
        }}
        aria-label="ChefMate is typing"
        role="status"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-terracotta)',
              animation: `typingDot 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
