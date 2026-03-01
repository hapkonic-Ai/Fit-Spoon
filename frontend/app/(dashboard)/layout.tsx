import { AppProviders } from '@/components/providers/AppProviders';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { FloatingChatButton } from '@/components/layout/FloatingChatButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      {/* Skip to main content link for keyboard / screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium focus:text-sm"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
        {/* Subtle ambient glow orbs for luxury feel */}
        <div
          className="fixed top-0 right-0 w-[40vw] h-[40vh] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
          style={{ background: 'var(--color-gold)' }}
        />
        <div
          className="fixed bottom-0 left-0 w-[30vw] h-[30vh] rounded-full opacity-[0.03] blur-3xl pointer-events-none"
          style={{ background: 'var(--color-primary)' }}
        />
        {/* Sidebar (desktop) */}
        <DashboardNav />

        {/* Main content */}
        <main id="main-content" className="flex-1 min-w-0 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Persistent AI chat button (hidden on /chat and /cooking) */}
      <FloatingChatButton />
    </AppProviders>
  );
}
