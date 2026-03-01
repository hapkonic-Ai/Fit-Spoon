'use client';

import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function Chip({ label, onRemove, selected, onClick, size = 'md', className }: ChipProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-150 select-none';

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        base,
        sizes[size],
        selected
          ? 'bg-[var(--color-primary)] text-white'
          : 'glass-card text-[var(--color-text-secondary)]',
        onClick && 'cursor-pointer hover:bg-[var(--color-primary)] hover:text-white',
        className
      )}
      style={selected ? { boxShadow: 'var(--shadow-luxury)', border: '1px solid var(--color-gold)' } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick && selected !== undefined ? selected : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 transition-opacity focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
