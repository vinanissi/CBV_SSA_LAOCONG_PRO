import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';

interface NextTaskCardProps {
  nextItem: WorkInboxFocusItem | null;
  progressLabel?: string;
  onGoNext: () => void;
}

export function NextTaskCard({ nextItem, progressLabel, onGoNext }: NextTaskCardProps) {
  if (!nextItem) return null;

  return (
    <div className="work-inbox-next-task-card" data-cbv-panel="work-inbox-next-task-card">
      <div className="work-inbox-next-task-card__header">
        <p className="work-inbox-next-task-card__label">VIỆC TIẾP THEO</p>
        {progressLabel && (
          <span className="work-inbox-next-task-card__counter tabular-nums">{progressLabel}</span>
        )}
      </div>
      <button type="button" className="work-inbox-next-task-card__button" onClick={onGoNext}>
        <span className="min-w-0 flex-1 truncate font-medium text-operational-text">{nextItem.title}</span>
        <span className="shrink-0 text-xs font-semibold text-blue-700">Xem tiếp →</span>
      </button>
    </div>
  );
}
