'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChefHat, Heart, BarChart3, Refrigerator, User, Settings, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/chat',       label: 'Chat',       icon: MessageCircle },
  { href: '/recipes',    label: 'Recipes',    icon: ChefHat },
  { href: '/nutrition',  label: 'Health',     icon: Heart },
  { href: '/fridge',     label: 'Fridge',     icon: Refrigerator },
  { href: '/mood',       label: 'Mood',       icon: BarChart3 },
  { href: '/profile',    label: 'Profile',    icon: User },
  { href: '/settings',   label: 'Settings',   icon: Settings },
];

// Mobile bottom nav — shows only 5 main items
const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop Sidebar — glass morphism */}
      <nav
        className="hidden lg:flex flex-col gap-1 w-64 h-screen sticky top-0 p-6 border-r"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          borderColor: 'var(--glass-border)',
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍳</span>
            <div>
              <h1 className="font-bold text-lg leading-none luxury-text" style={{ fontFamily: 'var(--font-display)' }}>
                ChefMate
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-gold)' }}>AI Kitchen Companion</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200',
              isActive(href)
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
            )}
            style={isActive(href) ? {
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-glass)',
            } : undefined}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <Icon
              size={20}
              style={{ color: isActive(href) ? 'var(--color-primary)' : undefined }}
            />
            {label}
            {isActive(href) && (
              <span
                className="ml-auto w-2 h-2 rounded-full"
                style={{ background: 'var(--color-gold)', boxShadow: '0 0 6px rgba(212,168,83,0.4)' }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Mobile Bottom Nav — glass */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.3)',
          paddingTop: '8px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
        aria-label="Mobile navigation"
      >
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] touch-manipulation"
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <div
              className={cn(
                'flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200',
                isActive(href) ? 'bg-[var(--color-primary-light)]' : ''
              )}
            >
              <Icon
                size={22}
                style={{ color: isActive(href) ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              />
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive(href) ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
