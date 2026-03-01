'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';

export function FloatingChatButton() {
  const router = useRouter();
  const pathname = usePathname();
  const avatarState = useUIStore((s) => s.avatarState);

  // Hide on the chat page itself and on cooking mode (full-screen)
  const isHidden = pathname.startsWith('/chat') || pathname.startsWith('/cooking');

  // Show a subtle pulse when avatar is in listening/thinking state
  const isPulsing = avatarState === 'listening' || avatarState === 'thinking';

  if (isHidden) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.button
          onClick={() => router.push('/chat')}
          className="relative flex items-center justify-center w-14 h-14 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: 'var(--gradient-luxury)',
            boxShadow: 'var(--shadow-luxury), 0 4px 20px rgba(212,168,83,0.30)',
            '--tw-ring-color': 'var(--color-gold)',
          } as React.CSSProperties}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Open ChefMate AI chat"
        >
          <MessageCircle size={24} color="white" strokeWidth={2.5} />

          {/* Gold pulsing ring when avatar is active */}
          {isPulsing && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid var(--color-gold)', boxShadow: '0 0 12px rgba(212,168,83,0.4)' }}
              animate={{ scale: [1, 1.4, 1.4], opacity: [0.7, 0, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}

          {/* Unread dot — gold accent */}
          <span
            className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: 'var(--color-gold)', boxShadow: '0 0 6px rgba(212,168,83,0.5)' }}
            aria-hidden="true"
          />
        </motion.button>

        {/* Tooltip label on hover (desktop) */}
        <div
          className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-md)',
          }}
          aria-hidden="true"
        >
          Chat with ChefMate
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
