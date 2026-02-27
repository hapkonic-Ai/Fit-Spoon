'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  emoji?: string;
  className?: string;
}

export function MacroBar({ label, value, max, unit = 'g', color = '#FF8C42', emoji, className }: MacroBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.min((value / max) * 100, 100);
  const isComplete = value >= max;

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = '0%';
    const timeout = setTimeout(() => {
      bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.width = `${pct}%`;
    }, 100);
    return () => clearTimeout(timeout);
  }, [pct]);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
          {emoji && <span>{emoji}</span>}
          {label}
        </span>
        <span className="text-[var(--color-text-muted)]">
          {value}{unit} / {max}{unit}
          {isComplete && <span className="ml-1.5 text-[var(--color-success)]">✅</span>}
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-border-light)' }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={`${label}: ${value} of ${max}${unit}`}
      >
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ backgroundColor: isComplete ? 'var(--color-success)' : color, width: '0%' }}
        />
      </div>
    </div>
  );
}
