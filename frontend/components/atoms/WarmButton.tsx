'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface WarmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glass' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const WarmButton = forwardRef<HTMLButtonElement, WarmButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-full cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] group relative overflow-hidden';

    const variants = {
      primary:
        'text-white bg-gradient-to-r from-[#FF8C42] to-[#FFD166] hover:-translate-y-0.5',
      secondary:
        'bg-[var(--color-secondary-light)] text-[var(--color-text)] border border-[var(--color-border-light)] hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)] hover:-translate-y-0.5',
      ghost:
        'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
      outline:
        'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:-translate-y-0.5',
      danger:
        'bg-[var(--color-error)] text-white hover:bg-red-600 hover:-translate-y-0.5',
      glass:
        'glass-card text-[var(--color-text)] hover:-translate-y-0.5',
      gold:
        'text-white hover:-translate-y-0.5',
    };

    const shadowMap: Record<string, string | undefined> = {
      primary: 'var(--shadow-card), 0 8px 32px rgba(255,140,66,0.20)',
      gold: 'var(--shadow-luxury)',
    };

    const sizes = {
      sm: 'h-8 px-4 text-sm',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        style={{
          ...(shadowMap[variant] ? { boxShadow: shadowMap[variant] } : {}),
          ...(variant === 'gold' ? { background: 'var(--gradient-luxury)' } : {}),
        }}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {/* Gold shimmer overlay on hover */}
        {(variant === 'primary' || variant === 'gold') && (
          <span className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        {loading && (
          <span className="relative z-10 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

WarmButton.displayName = 'WarmButton';
