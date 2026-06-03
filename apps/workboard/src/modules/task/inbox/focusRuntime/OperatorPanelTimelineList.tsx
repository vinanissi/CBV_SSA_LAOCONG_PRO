import type { TimelineItem } from '@/api/contracts';
import {
  formatFocusTimelineActor,
  formatFocusTimelineClock,
  formatFocusTimelineFriendlyLabel,
} from './focusLayoutShared';

export interface OperatorPanelTimelineListProps {
  entries: TimelineItem[];
  emptyMessage?: string;
}

export function OperatorPanelTimelineList({
  entries,
  emptyMessage = 'Chưa có sự kiện.',
}: OperatorPanelTimelineListProps) {
  if (entries.length === 0) {
    return <p className="text-operational-muted text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="work-inbox-right-timeline-list work-inbox-right-timeline-list--friendly space-y-2">
      {entries.map((entry, i) => {
        const label = formatFocusTimelineFriendlyLabel({
          eventType: entry.action,
          eventLabel: entry.message,
          action: entry.action,
          message: entry.message,
        });
        const actorLabel = formatFocusTimelineActor(entry.actor);
        const key =
          'resourceId' in entry && entry.resourceId ? entry.resourceId : `${entry.time}-${i}`;
        return (
          <li key={key} className="work-inbox-right-timeline-list__item">
            <p className="work-inbox-right-timeline-list__line">
              <span className="work-inbox-right-timeline-list__time">
                {formatFocusTimelineClock(entry.time)}
              </span>
              <span className="work-inbox-right-timeline-list__label"> — {label}</span>
            </p>
            {actorLabel ? (
              <p className="work-inbox-right-timeline-list__actor">{actorLabel}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
