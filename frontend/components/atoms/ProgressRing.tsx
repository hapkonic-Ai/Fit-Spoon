'use client';

import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export function ProgressRing({
  value,
  max,
  size = 160,
  strokeWidth = 14,
  color = 'var(--color-primary)',
  trackColor = 'var(--color-border-light)',
  label,
  sublabel,
  animate = true,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - pct);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    const circle = circleRef.current;
    circle.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      circle.style.strokeDashoffset = String(offset);
    });
    return () => cancelAnimationFrame(raf);
  }, [offset, circumference, animate]);

  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`${label}: ${value} of ${max}`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
        />
      </svg>

      {/* Center label */}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {label && (
            <span className="text-2xl font-bold text-[var(--color-text)] leading-tight">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-xs text-[var(--color-text-muted)] mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
