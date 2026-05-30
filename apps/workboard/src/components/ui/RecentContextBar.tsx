import { getRecentTasks, getLastWorkingTask } from '@/shared/utils/recentContext';

interface RecentContextBarProps {
  currentTaskId?: string | null;
  onResume: (taskId: string) => void;
}

export function RecentContextBar({ currentTaskId, onResume }: RecentContextBarProps) {
  const recent = getRecentTasks().filter((t) => t.taskId !== currentTaskId);
  const last = getLastWorkingTask();

  if (recent.length === 0) return null;

  return (
    <div className="recent-context-bar">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Bạn đang làm dở
      </span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {last && last.taskId !== currentTaskId && (
          <button
            type="button"
            className="recent-context-chip recent-context-primary"
            onClick={() => onResume(last.taskId)}
          >
            ↩ {last.title.slice(0, 40)}
            {last.nextActionLabel ? ` · ${last.nextActionLabel}` : ''}
          </button>
        )}
        {recent.slice(0, 4).map((t) => (
          <button
            key={t.taskId}
            type="button"
            className="recent-context-chip"
            onClick={() => onResume(t.taskId)}
          >
            {t.title.slice(0, 32)}
          </button>
        ))}
      </div>
    </div>
  );
}
