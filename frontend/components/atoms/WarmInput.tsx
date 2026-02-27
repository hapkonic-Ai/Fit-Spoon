'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface WarmInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const WarmInput = forwardRef<HTMLInputElement, WarmInputProps>(
  ({ className, label, error, icon, iconRight, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 bg-[var(--color-card)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
              'border border-[var(--color-border-light)] rounded-xl px-4',
              'transition-all duration-200',
              'focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(255,140,66,0.15)]',
              'hover:border-[var(--color-border-mid)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,71,111,0.15)]',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

WarmInput.displayName = 'WarmInput';
