'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { AvatarState } from '@/stores/uiStore';

interface AvatarParticlesProps {
  state: AvatarState;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

function generateParticles(count: number, spread: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * spread,
    y: Math.random() * -20 - 10,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 2 + Math.random() * 3,
  }));
}

const PARTICLE_CONFIGS: Record<AvatarState, { count: number; color: string; shape: 'circle' | 'heart' | 'sparkle' | 'steam' | 'bubble' }> = {
  idle:        { count: 5, color: '#D4A853', shape: 'sparkle' },
  thinking:    { count: 3, color: '#C97D4E', shape: 'bubble' },
  happy:       { count: 6, color: '#EF476F', shape: 'heart' },
  cooking:     { count: 5, color: '#FFFFFF', shape: 'steam' },
  empathy:     { count: 4, color: '#F4A261', shape: 'circle' },
  listening:   { count: 4, color: '#D4A853', shape: 'sparkle' },
  celebrating: { count: 8, color: '#FFD166', shape: 'sparkle' },
};

function ParticleShape({ shape, color, size }: { shape: string; color: string; size: number }) {
  switch (shape) {
    case 'heart':
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <path d="M6 10.5C6 10.5 1 7.5 1 4.5C1 2.5 3 1.5 4.5 2.5C5.3 3 5.7 3.5 6 4C6.3 3.5 6.7 3 7.5 2.5C9 1.5 11 2.5 11 4.5C11 7.5 6 10.5 6 10.5Z" fill={color} />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill={color} />
        </svg>
      );
    case 'steam':
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <path d="M6 12C6 12 3 8 3 6C3 4 5 3 6 5C7 3 9 4 9 6C9 8 6 12 6 12Z" fill={color} opacity="0.6" />
        </svg>
      );
    case 'bubble':
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
          <circle cx="4" cy="4" r="1.5" fill={color} opacity="0.3" />
        </svg>
      );
    default:
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4" fill={color} />
        </svg>
      );
  }
}

export function AvatarParticles({ state, size }: AvatarParticlesProps) {
  const config = PARTICLE_CONFIGS[state];
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles only on the client to avoid hydration mismatch from Math.random()
  useEffect(() => {
    setParticles(generateParticles(config.count, size * 0.8));
  }, [config.count, size]);

  const cx = size / 2;
  const cy = size / 2;

  if (particles.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ left: cx + p.x, top: cy }}
            initial={{ y: 0, opacity: 0, scale: 0.3 }}
            animate={{
              y: p.y * (size / 100),
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            <ParticleShape shape={config.shape} color={config.color} size={p.size} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
