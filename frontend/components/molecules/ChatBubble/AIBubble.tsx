'use client';

import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { RecipeCardChat } from '@/components/molecules/RecipeCardChat';
import type { RecipeCard } from '@chefmate/shared';

interface AIBubbleProps {
  content: string;
  recipes?: RecipeCard[];
  isStreaming?: boolean;
  timestamp?: Date;
}

export function AIBubble({ content, recipes, isStreaming, timestamp }: AIBubbleProps) {
  return (
    <div className="flex items-end gap-2 animate-fade-in-up max-w-[85%]">
      <ChefMateAvatar state={isStreaming ? 'thinking' : 'idle'} size="sm" />
      <div className="flex flex-col gap-2">
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid rgba(255,140,66,0.15)',
            borderRadius: '4px 20px 20px 20px',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-text)',
            minWidth: '60px',
          }}
        >
          {content || <span className="opacity-0">|</span>}
          {isStreaming && (
            <span
              className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded"
              style={{
                background: 'var(--color-primary)',
                animation: 'sunrisePulse 0.8s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Embedded recipe cards */}
        {recipes && recipes.length > 0 && (
          <div className="flex flex-col gap-2">
            {recipes.map((recipe, i) => (
              <RecipeCardChat key={i} recipe={recipe} />
            ))}
          </div>
        )}

        {timestamp && !isStreaming && (
          <time
            className="text-xs self-start ml-1"
            style={{ color: 'var(--color-text-muted)' }}
            dateTime={timestamp.toISOString()}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        )}
      </div>
    </div>
  );
}
