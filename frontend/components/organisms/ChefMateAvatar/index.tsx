'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { AvatarState } from '@/stores/uiStore';

interface ChefMateAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = { sm: 64, md: 96, lg: 140, xl: 200 };

// Expression configs per state
const EXPRESSIONS: Record<AvatarState, { eyebrowY: number; mouthPath: string; cheeks: boolean; eyeScale: number }> = {
  idle:        { eyebrowY: 0,  mouthPath: 'M 30 58 Q 50 66 70 58', cheeks: false, eyeScale: 1 },
  thinking:    { eyebrowY: -3, mouthPath: 'M 35 60 Q 50 60 65 60', cheeks: false, eyeScale: 0.85 },
  happy:       { eyebrowY: -2, mouthPath: 'M 28 56 Q 50 70 72 56', cheeks: true,  eyeScale: 1.1 },
  cooking:     { eyebrowY: -1, mouthPath: 'M 32 58 Q 50 65 68 58', cheeks: false, eyeScale: 1 },
  empathy:     { eyebrowY: 2,  mouthPath: 'M 30 60 Q 50 64 70 60', cheeks: false, eyeScale: 0.95 },
  listening:   { eyebrowY: -1, mouthPath: 'M 38 60 Q 50 60 62 60', cheeks: false, eyeScale: 1.05 },
  celebrating: { eyebrowY: -4, mouthPath: 'M 26 54 Q 50 72 74 54', cheeks: true,  eyeScale: 1.15 },
};

// Body animations per state
const BODY_ANIMATIONS: Record<AvatarState, TargetAndTransition> = {
  idle:        { y: [0, -2, 0], scaleY: [1, 1.02, 1], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
  thinking:    { x: [0, 3, 0, -3, 0], transition: { duration: 2, repeat: Infinity } },
  happy:       { y: [0, -12, 0, -6, 0], transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] } },
  cooking:     { rotate: [-2, 2, -2], transition: { duration: 0.6, repeat: Infinity } },
  empathy:     { x: [0, 4, 0], rotate: [0, 5, 0], transition: { duration: 1.5, ease: 'easeInOut' } },
  listening:   { scale: [1, 1.02, 1], transition: { duration: 1.2, repeat: Infinity } },
  celebrating: { y: [0, -16, 0, -8, 0], rotate: [0, -5, 5, 0], transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] } },
};

export function ChefMateAvatar({ state = 'idle', size = 'md', className }: ChefMateAvatarProps) {
  const px = SIZE_MAP[size];
  const expr = EXPRESSIONS[state];
  const bodyAnim = BODY_ANIMATIONS[state];

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: px, height: px }}
      aria-label={`ChefMate AI avatar — ${state}`}
      role="img"
    >
      {/* Thinking glow ring */}
      <AnimatePresence>
        {state === 'thinking' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(255,140,66,0.2) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Listening pulse */}
      <AnimatePresence>
        {state === 'listening' && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-[var(--color-primary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.04, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Main Avatar SVG */}
      <motion.div animate={bodyAnim} style={{ width: px, height: px }}>
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chef Hat */}
          <g>
            <rect x="30" y="12" width="40" height="20" rx="4" fill="#FFFFFF" stroke="#FFECD2" strokeWidth="1.5" />
            <rect x="25" y="28" width="50" height="8" rx="3" fill="#FFECD2" />
            {/* Hat stripe */}
            <rect x="30" y="8" width="40" height="8" rx="4" fill="#FF8C42" opacity="0.3" />
          </g>

          {/* Face */}
          <circle cx="50" cy="55" r="24" fill="#FFD4AA" />

          {/* Cheeks */}
          <AnimatePresence>
            {expr.cheeks && (
              <>
                <motion.circle
                  cx="30" cy="60" r="5"
                  fill="#EF476F" opacity="0.3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
                <motion.circle
                  cx="70" cy="60" r="5"
                  fill="#EF476F" opacity="0.3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Eyes */}
          <motion.g animate={{ scaleY: expr.eyeScale }} style={{ transformOrigin: '50% 50%' }}>
            {/* Left eye */}
            <motion.ellipse
              cx="41" cy="52" rx="4.5" ry="4.5"
              fill="#3A2D28"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 }}
            />
            <circle cx="42.5" cy="50.5" r="1.5" fill="white" />

            {/* Right eye */}
            <motion.ellipse
              cx="59" cy="52" rx="4.5" ry="4.5"
              fill="#3A2D28"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 + 0.5 }}
            />
            <circle cx="60.5" cy="50.5" r="1.5" fill="white" />
          </motion.g>

          {/* Thinking dots */}
          <AnimatePresence>
            {state === 'thinking' && (
              <g>
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={44 + i * 6}
                    cy="68"
                    r="2"
                    fill="var(--color-terracotta)"
                    initial={{ y: 0, opacity: 0.3 }}
                    animate={{ y: [-4, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </g>
            )}
          </AnimatePresence>

          {/* Eyebrows */}
          <motion.g animate={{ y: expr.eyebrowY }} transition={{ duration: 0.3 }}>
            <path d="M 36 44 Q 41 42 46 44" stroke="#3A2D28" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 54 44 Q 59 42 64 44" stroke="#3A2D28" strokeWidth="2" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* Mouth */}
          <motion.path
            d={expr.mouthPath}
            stroke="#3A2D28"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ d: expr.mouthPath }}
            transition={{ duration: 0.3 }}
          />

          {/* Chef uniform */}
          <path d="M 26 79 Q 26 72 34 72 L 66 72 Q 74 72 74 79 L 74 100 L 26 100 Z" fill="#FFFFFF" />
          <path d="M 46 72 L 46 100 M 54 72 L 54 100" stroke="#FFECD2" strokeWidth="1" />
          {/* Buttons */}
          <circle cx="50" cy="77" r="2" fill="#FFD166" />
          <circle cx="50" cy="84" r="2" fill="#FFD166" />

          {/* Arms based on state */}
          {state === 'celebrating' ? (
            <>
              <motion.path
                d="M 26 75 Q 15 65 12 55"
                stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round"
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.path
                d="M 74 75 Q 85 65 88 55"
                stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round"
                animate={{ rotate: [10, -10, 10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </>
          ) : state === 'cooking' ? (
            <>
              <path d="M 26 75 Q 18 80 16 85" stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round" />
              <motion.path
                d="M 74 75 Q 82 70 86 65"
                stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '74px 75px' }}
              />
              {/* Spoon */}
              <text x="82" y="68" fontSize="12">🥄</text>
            </>
          ) : (
            <>
              <path d="M 26 75 Q 18 82 16 88" stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 74 75 Q 82 82 84 88" stroke="#FFD4AA" strokeWidth="8" fill="none" strokeLinecap="round" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
