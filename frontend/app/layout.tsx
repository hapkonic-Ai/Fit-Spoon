import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'ChefMate AI — Your Warm Kitchen Companion',
  description:
    'A warm, friendly AI cooking assistant that helps you discover recipes, track nutrition, and feel cared for in the kitchen.',
  manifest: '/manifest.json',
  icons: { apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF8C42',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen" style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
