'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import type { AvatarState } from '@/stores/uiStore';
import { AvatarParticles } from './AvatarParticles';

interface ChefMateAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = { sm: 64, md: 96, lg: 140, xl: 200 };

// Expression configs per state — enhanced with blush dynamics, teeth, head tilt
const EXPRESSIONS: Record<AvatarState, {
  eyebrowY: number;
  mouthPath: string;
  cheeks: boolean;
  cheekOpacity: number;
  cheekScale: number;
  eyeScale: number;
  showTeeth: boolean;
  headTilt: number;
  eyeOffsetX: number;
  eyeOffsetY: number;
}> = {
  idle:        { eyebrowY: 0,  mouthPath: 'M 30 58 Q 50 66 70 58', cheeks: false, cheekOpacity: 0, cheekScale: 1, eyeScale: 1, showTeeth: false, headTilt: 0, eyeOffsetX: 0, eyeOffsetY: 0 },
  thinking:    { eyebrowY: -3, mouthPath: 'M 35 60 Q 50 60 65 60', cheeks: false, cheekOpacity: 0, cheekScale: 1, eyeScale: 0.85, showTeeth: false, headTilt: -3, eyeOffsetX: -2, eyeOffsetY: -1.5 },
  happy:       { eyebrowY: -2, mouthPath: 'M 28 56 Q 50 70 72 56', cheeks: true, cheekOpacity: 0.4, cheekScale: 1.1, eyeScale: 1.1, showTeeth: true, headTilt: 0, eyeOffsetX: 0, eyeOffsetY: 0 },
  cooking:     { eyebrowY: -1, mouthPath: 'M 32 58 Q 50 65 68 58', cheeks: false, cheekOpacity: 0, cheekScale: 1, eyeScale: 1, showTeeth: false, headTilt: 1, eyeOffsetX: 1, eyeOffsetY: 0 },
  empathy:     { eyebrowY: 2,  mouthPath: 'M 30 60 Q 50 64 70 60', cheeks: true, cheekOpacity: 0.2, cheekScale: 0.9, eyeScale: 0.95, showTeeth: false, headTilt: 2, eyeOffsetX: 0, eyeOffsetY: 0.5 },
  listening:   { eyebrowY: -1, mouthPath: 'M 38 60 Q 50 60 62 60', cheeks: false, cheekOpacity: 0, cheekScale: 1, eyeScale: 1.05, showTeeth: false, headTilt: 0, eyeOffsetX: 0, eyeOffsetY: 0 },
  celebrating: { eyebrowY: -4, mouthPath: 'M 26 54 Q 50 72 74 54', cheeks: true, cheekOpacity: 0.5, cheekScale: 1.2, eyeScale: 1.15, showTeeth: true, headTilt: 0, eyeOffsetX: 0, eyeOffsetY: 0 },
};

// Aura intensity per state
const AURA_INTENSITY: Record<AvatarState, number> = {
  idle: 0.4,
  thinking: 0.5,
  happy: 0.7,
  cooking: 0.5,
  empathy: 0.3,
  listening: 0.5,
  celebrating: 0.9,
};

// Body animations per state — refined
const BODY_ANIMATIONS: Record<AvatarState, TargetAndTransition> = {
  idle:        { y: [0, -2, 0], x: [0, 0.5, 0, -0.5, 0], scaleY: [1, 1.02, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  thinking:    { x: [0, 3, 0, -3, 0], transition: { duration: 2, repeat: Infinity } },
  happy:       { y: [0, -12, 0, -6, 0], transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] } },
  cooking:     { rotate: [-2, 2, -2], y: [0, -1, 0], transition: { duration: 0.6, repeat: Infinity } },
  empathy:     { x: [0, 4, 0], rotate: [0, 5, 0], transition: { duration: 1.5, ease: 'easeInOut' } },
  listening:   { scale: [1, 1.02, 1], transition: { duration: 1.2, repeat: Infinity } },
  celebrating: { y: [0, -16, 0, -8, 0], rotate: [0, -5, 5, 0], transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] } },
};

// Eye tracking hook — follows mouse cursor
function useEyeTracking(containerRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !enabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);
    setOffset({
      x: Math.max(-3, Math.min(3, dx * 3)),
      y: Math.max(-2, Math.min(2, dy * 2)),
    });
  }, [containerRef, enabled]);

  useEffect(() => {
    if (!enabled) { setOffset({ x: 0, y: 0 }); return; }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, enabled]);

  return offset;
}

// Blink hook — randomized natural blink cycle
function useBlink() {
  const [leftBlink, setLeftBlink] = useState(false);
  const [rightBlink, setRightBlink] = useState(false);

  useEffect(() => {
    const blinkCycle = () => {
      const delay = 3000 + Math.random() * 3000;
      const timer = setTimeout(() => {
        setLeftBlink(true);
        setTimeout(() => setRightBlink(true), 20 + Math.random() * 40);
        setTimeout(() => { setLeftBlink(false); setRightBlink(false); }, 150);
        blinkCycle();
      }, delay);
      return timer;
    };
    const timer = blinkCycle();
    return () => clearTimeout(timer);
  }, []);

  return { leftBlink, rightBlink };
}

export function ChefMateAvatar({ state = 'idle', size = 'md', className }: ChefMateAvatarProps) {
  const px = SIZE_MAP[size];
  const expr = EXPRESSIONS[state];
  const bodyAnim = BODY_ANIMATIONS[state];
  const auraIntensity = AURA_INTENSITY[state];
  const containerRef = useRef<HTMLDivElement>(null);

  // Eye tracking (disabled during thinking — eyes look up-left instead)
  const trackEyes = state !== 'thinking';
  const eyeTrack = useEyeTracking(containerRef, trackEyes);
  const { leftBlink, rightBlink } = useBlink();

  // Final eye offset: state-defined + mouse tracking
  const eyeX = expr.eyeOffsetX + (trackEyes ? eyeTrack.x : 0);
  const eyeY = expr.eyeOffsetY + (trackEyes ? eyeTrack.y : 0);

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: px, height: px }}
      aria-label={`ChefMate AI avatar — ${state}`}
      role="img"
    >
      {/* Aura glow behind avatar */}
      <motion.div
        className="absolute inset-[-20%] rounded-full pointer-events-none"
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [auraIntensity * 0.6, auraIntensity, auraIntensity * 0.6],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'var(--gradient-avatar-aura)' }}
      />

      {/* Listening pulse ring */}
      <AnimatePresence>
        {state === 'listening' && (
          <motion.div
            className="absolute inset-[-6px] rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ border: '2px solid var(--color-gold)', boxShadow: '0 0 12px rgba(212,168,83,0.3)' }}
          />
        )}
      </AnimatePresence>

      {/* Particle system */}
      <AvatarParticles state={state} size={px} />

      {/* Main Avatar SVG — with head tilt */}
      <motion.div
        animate={{ ...bodyAnim, rotate: expr.headTilt }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="faceGrad" cx="45%" cy="40%">
              <stop offset="0%" stopColor="#FFE0B8" />
              <stop offset="100%" stopColor="#FFD4AA" />
            </radialGradient>
          </defs>

          {/* Chef Hat — with gold accent */}
          <motion.g
            animate={{ rotate: state === 'celebrating' ? [-2, 2, -2] : 0 }}
            transition={state === 'celebrating' ? { duration: 0.4, repeat: Infinity } : {}}
            style={{ transformOrigin: '50px 20px' }}
          >
            <rect x="30" y="12" width="40" height="20" rx="4" fill="#FFFFFF" stroke="#FFECD2" strokeWidth="1.5" />
            <rect x="25" y="28" width="50" height="8" rx="3" fill="#FFECD2" />
            {/* Gold hat band */}
            <rect x="30" y="8" width="40" height="8" rx="4" fill="var(--color-gold)" opacity="0.4" />
            <rect x="30" y="8" width="40" height="1" rx="0.5" fill="var(--color-gold)" opacity="0.6" />
            {/* Sparkle on hat during celebrating */}
            {state === 'celebrating' && (
              <motion.g
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ transformOrigin: '60px 12px' }}
              >
                <path d="M60 8L61 11L64 12L61 13L60 16L59 13L56 12L59 11Z" fill="var(--color-gold)" />
              </motion.g>
            )}
          </motion.g>

          {/* Face — with subtle radial gradient */}
          <circle cx="50" cy="55" r="24" fill="url(#faceGrad)" />

          {/* Dynamic cheeks */}
          <AnimatePresence>
            {expr.cheeks && (
              <>
                <motion.circle
                  cx="30" cy="60" r="5"
                  fill={state === 'empathy' ? '#F4A261' : '#EF476F'}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: expr.cheekOpacity, scale: expr.cheekScale }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                />
                <motion.circle
                  cx="70" cy="60" r="5"
                  fill={state === 'empathy' ? '#F4A261' : '#EF476F'}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: expr.cheekOpacity, scale: expr.cheekScale }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Eyes — with tracking + independent blink */}
          <motion.g
            animate={{ scaleY: expr.eyeScale }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '50% 52%' }}
          >
            {/* Left eye */}
            <motion.g animate={{ x: eyeX, y: eyeY }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
              <motion.ellipse
                cx="41" cy="52" rx="4.5" ry="4.5"
                fill="#3A2D28"
                animate={{ scaleY: leftBlink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
                style={{ transformOrigin: '41px 52px' }}
              />
              <circle cx="42.5" cy="50.5" r="1.8" fill="white" opacity="0.9" />
            </motion.g>

            {/* Right eye */}
            <motion.g animate={{ x: eyeX, y: eyeY }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
              <motion.ellipse
                cx="59" cy="52" rx="4.5" ry="4.5"
                fill="#3A2D28"
                animate={{ scaleY: rightBlink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
                style={{ transformOrigin: '59px 52px' }}
              />
              <circle cx="60.5" cy="50.5" r="1.8" fill="white" opacity="0.9" />
            </motion.g>
          </motion.g>

          {/* Eyebrows */}
          <motion.g
            animate={{ y: expr.eyebrowY }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          >
            <path d="M 36 44 Q 41 42 46 44" stroke="#3A2D28" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 54 44 Q 59 42 64 44" stroke="#3A2D28" strokeWidth="2" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* Mouth — spring physics */}
          <motion.path
            d={expr.mouthPath}
            stroke="#3A2D28"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ d: expr.mouthPath }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          />

          {/* Teeth (visible for happy/celebrating) */}
          <AnimatePresence>
            {expr.showTeeth && (
              <motion.path
                d="M 38 62 Q 50 62 62 62 Q 62 67 50 67 Q 38 67 38 62"
                fill="white"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.9, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                style={{ transformOrigin: '50px 62px' }}
              />
            )}
          </AnimatePresence>

          {/* Empathy lip quiver */}
          {state === 'empathy' && (
            <motion.path
              d="M 30 60 Q 50 64 70 60"
              stroke="#3A2D28"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              animate={{ d: ['M 30 60 Q 50 64 70 60', 'M 30 60 Q 50 65 70 60', 'M 30 60 Q 50 64 70 60'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Chef uniform */}
          <path d="M 26 79 Q 26 72 34 72 L 66 72 Q 74 72 74 79 L 74 100 L 26 100 Z" fill="#FFFFFF" />
          <path d="M 46 72 L 46 100 M 54 72 L 54 100" stroke="#FFECD2" strokeWidth="1" />
          {/* Gold buttons */}
          <circle cx="50" cy="77" r="2" fill="var(--color-gold)" />
          <circle cx="50" cy="84" r="2" fill="var(--color-gold)" />
          <circle cx="50" cy="77" r="1" fill="var(--color-gold-light)" opacity="0.6" />
          <circle cx="50" cy="84" r="1" fill="var(--color-gold-light)" opacity="0.6" />

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
