'use client';

import { Clock, Flame, ChefHat } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { RecipeCard } from '@chefmate/shared';

interface RecipeCardChatProps {
  recipe: RecipeCard;
  onView?: () => void;
  className?: string;
}

export function RecipeCardChat({ recipe, onView, className }: RecipeCardChatProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-3 transition-all duration-200 cursor-pointer hover:-translate-y-0.5',
        className
      )}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderLeft: '3px solid var(--color-gold)',
        boxShadow: 'var(--shadow-glass)',
      }}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView?.()}
      aria-label={`View recipe: ${recipe.title}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {recipe.title}
        </h4>
        {recipe.aiGenerated && (
          <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            ✨ AI
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {recipe.prepTimeMins > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {recipe.prepTimeMins}min
          </span>
        )}
        {recipe.calories > 0 && (
          <span className="flex items-center gap-1">
            <Flame size={12} />
            {recipe.calories} cal
          </span>
        )}
        {recipe.difficulty && (
          <span className="flex items-center gap-1">
            <ChefHat size={12} />
            {recipe.difficulty}
          </span>
        )}
      </div>

      {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
