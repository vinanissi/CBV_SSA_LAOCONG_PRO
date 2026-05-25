import type { TimelineItem } from '@/api/contracts';
import { formatDate } from '@/shared/utils';

export function TimelineList({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có lịch sử cập nhật.</p>;
  }

  return (
    <ul className="space-y-0">
      {items.map((item, i) => (
        <li key={`${item.resourceId}-${i}`} className="relative pb-5 pl-5 last:pb-0">
          {i < items.length - 1 && (
            <span className="absolute bottom-0 left-[7px] top-3 w-px bg-border/70" aria-hidden />
          )}
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent/50 bg-surface-content" />
          <p className="text-[11px] text-slate-500">
            {formatDate(item.time)} · {item.actor}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">{item.action}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
