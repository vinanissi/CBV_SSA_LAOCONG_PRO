import type { TimelineItem } from '@/api/contracts';
import { formatDate } from '@/shared/utils';

export function TimelineList({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có lịch sử.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${item.resourceId}-${i}`} className="border-l-2 border-border pl-3">
          <p className="text-xs text-slate-500">{formatDate(item.time)} · {item.actor}</p>
          <p className="text-sm text-slate-200">{item.action}</p>
          <p className="text-sm text-slate-400">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
