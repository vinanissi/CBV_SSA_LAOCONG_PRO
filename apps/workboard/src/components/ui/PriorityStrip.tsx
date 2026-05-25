interface PriorityStripProps {
  items: { label: string; count: number; href?: string; tone?: 'default' | 'warn' | 'error' }[];
}

const TONE_CLASS = {
  default: 'bg-surface-overlay text-slate-200',
  warn: 'bg-status-warn/15 text-status-warn',
  error: 'bg-status-error/15 text-status-error',
};

export function PriorityStrip({ items }: PriorityStripProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg px-4 py-3 ${TONE_CLASS[item.tone ?? 'default']}`}
        >
          <p className="text-2xl font-bold">{item.count}</p>
          <p className="text-xs">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
