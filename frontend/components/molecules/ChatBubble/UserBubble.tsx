'use client';

interface UserBubbleProps {
  content: string;
  timestamp?: Date;
}

export function UserBubble({ content, timestamp }: UserBubbleProps) {
  return (
    <div className="flex flex-col items-end gap-1 animate-fade-in-up max-w-[78%] ml-auto">
      <div
        className="px-4 py-3 text-sm leading-relaxed text-white"
        style={{
          background: 'var(--gradient-luxury)',
          borderRadius: '20px 4px 20px 20px',
          boxShadow: 'var(--shadow-luxury)',
        }}
      >
        {content}
      </div>
      {timestamp && (
        <time
          className="text-xs mr-1"
          style={{ color: 'var(--color-text-muted)' }}
          dateTime={timestamp.toISOString()}
        >
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      )}
    </div>
  );
}
