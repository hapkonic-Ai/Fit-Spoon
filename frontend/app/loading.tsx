export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full animate-spin border-4"
          style={{
            borderColor: 'var(--color-border-light)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          ChefMate is getting ready... 🍳
        </p>
      </div>
    </div>
  );
}
