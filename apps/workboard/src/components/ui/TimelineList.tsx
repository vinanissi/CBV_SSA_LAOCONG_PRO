import type { TimelineItem } from '@/api/contracts';
import { formatDate } from '@/shared/utils';
import { getTimelineActorDisplay, resolveTimelineText } from '@/runtime/userDisplay';
import { isHandoffTimelineItem, isWaitingTimelineItem } from '@/shared/utils/handoffRuntime';

interface TimelineListProps {
  items: TimelineItem[];
  compact?: boolean;
  limit?: number;
  highlightCoordination?: boolean;
}

export function TimelineList({ items, compact, limit, highlightCoordination }: TimelineListProps) {
  const visible = limit && limit > 0 ? items.slice(0, limit) : items;

  if (items.length === 0) {
    return <p className="task-meta-passive text-xs">Chưa có lịch sử.</p>;
  }

  function itemClass(item: TimelineItem): string {
    if (!highlightCoordination) return '';
    if (isHandoffTimelineItem(item)) return 'timeline-handoff';
    if (isWaitingTimelineItem(item)) return 'timeline-waiting';
    return '';
  }

  if (compact) {
    return (
      <ul className="space-y-1">
        {visible.map((item, i) => (
          <li key={`${item.resourceId}-${i}`} className={`flex gap-2 text-[11px] leading-tight ${itemClass(item)}`}>
            <span className="shrink-0 font-medium text-slate-700">{formatDate(item.time)?.slice(5) || '—'}</span>
            <span className="min-w-0 truncate text-slate-800">
              {isHandoffTimelineItem(item) && <span className="font-medium text-blue-700">[HANDOFF] </span>}
              {isWaitingTimelineItem(item) && !isHandoffTimelineItem(item) && (
                <span className="font-medium text-amber-700">[WAITING] </span>
              )}
              <span className="text-slate-700">{getTimelineActorDisplay(item)}</span>
              {' · '}
              {resolveTimelineText(item.message || item.action)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-0">
      {visible.map((item, i) => (
        <li key={`${item.resourceId}-${i}`} className={`relative pb-5 pl-5 last:pb-0 ${itemClass(item)}`}>
          {i < visible.length - 1 && (
            <span className="absolute bottom-0 left-[7px] top-3 w-px bg-border/70" aria-hidden />
          )}
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent/50 bg-surface-content" />
          <p className="text-[11px] text-slate-500">
            {formatDate(item.time)} · {getTimelineActorDisplay(item)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">{resolveTimelineText(item.action)}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{resolveTimelineText(item.message)}</p>
        </li>
      ))}
    </ul>
  );
}
