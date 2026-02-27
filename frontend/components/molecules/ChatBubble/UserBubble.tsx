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
          background: 'linear-gradient(135deg, #FF8C42, #FFD166)',
          borderRadius: '20px 4px 20px 20px',
          boxShadow: '0 4px 16px rgba(255,140,66,0.25)',
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
