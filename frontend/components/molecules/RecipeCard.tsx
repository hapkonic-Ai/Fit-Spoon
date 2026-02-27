'use client';

import { Clock, Flame, Heart } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { RecipeCard as RecipeCardData } from '@chefmate/shared';

interface RecipeCardProps {
  id?: string;
  title?: string;
  imageUrl?: string | null;
  cuisine?: string;
  difficulty?: string;
  prepTimeMins?: number;
  calories?: number;
  dietaryTags?: string[];
  isSaved?: boolean;
  onSave?: () => void;
  onClick?: () => void;
  className?: string;
  recipe?: RecipeCardData;
}

export function RecipeCard({
  recipe,
  id: idProp,
  title: titleProp,
  imageUrl: imageUrlProp,
  cuisine: cuisineProp,
  difficulty: difficultyProp,
  prepTimeMins: prepTimeMinsProp,
  calories: caloriesProp,
  dietaryTags: dietaryTagsProp = [],
  isSaved,
  onSave,
  onClick,
  className,
}: RecipeCardProps) {
  const id = recipe?.id ?? idProp ?? '';
  const title = recipe?.title ?? titleProp ?? '';
  const imageUrl = recipe?.imageUrl ?? imageUrlProp;
  const cuisine = recipe?.cuisine ?? cuisineProp ?? '';
  const difficulty = recipe?.difficulty ?? difficultyProp ?? 'easy';
  const prepTimeMins = recipe?.prepTimeMins ?? prepTimeMinsProp ?? 0;
  const calories = recipe?.calories ?? caloriesProp ?? 0;
  const dietaryTags = recipe?.dietaryTags ?? dietaryTagsProp;
  return (
    <article
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group',
        'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,140,66,0.20)]',
        className
      )}
      style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border-light)' }}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role="button"
      aria-label={`View ${title} recipe`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-warm-linen)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}

        {/* Save button */}
        {onSave && (
          <button
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            aria-label={isSaved ? 'Remove from saved' : 'Save recipe'}
          >
            <Heart
              size={16}
              className="transition-colors"
              style={{ color: isSaved ? 'var(--color-accent)' : 'var(--color-text-muted)', fill: isSaved ? 'var(--color-accent)' : 'none' }}
            />
          </button>
        )}

        {/* Dietary tags */}
        {dietaryTags.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--color-primary)' }}
            >
              {dietaryTags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          {cuisine}
        </p>

        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {prepTimeMins}m
          </span>
          <span className="flex items-center gap-1">
            <Flame size={11} />
            {calories} cal
          </span>
          <span
            className="ml-auto px-2 py-0.5 rounded-full capitalize text-xs"
            style={{
              background: difficulty === 'easy' ? 'var(--color-success-light, #D8F3DC)' : difficulty === 'hard' ? 'var(--color-accent-light)' : 'var(--color-secondary-light)',
              color: difficulty === 'easy' ? 'var(--color-success)' : difficulty === 'hard' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
          >
            {difficulty}
          </span>
        </div>
      </div>
    </article>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
      <div className="h-40 skeleton" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 skeleton rounded-full w-4/5" />
        <div className="h-3 skeleton rounded-full w-2/5" />
        <div className="h-3 skeleton rounded-full w-3/5" />
      </div>
    </div>
  );
}
