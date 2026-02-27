import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🍳</div>
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          404
        </h1>
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Recipe not found!
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Hmm, I couldn't find that page. Let's search for something delicious instead!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm text-white transition-all hover:scale-105"
          style={{ background: 'var(--gradient-sunrise)' }}
        >
          🏠 Back to Kitchen
        </Link>
      </div>
    </div>
  );
}
