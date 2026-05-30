import { getRecentTasks } from '@/shared/utils/recentContext';
import { getUnfinishedActions } from '@/shared/utils/taskContinuation';
import { getRecentModules } from '@/runtime/operationalLinkMemory';

interface RecentContextStripProps {
  currentTaskId?: string | null;
  onResumeTask: (taskId: string) => void;
  onOpenModule?: (moduleId: string) => void;
}

export function RecentContextStrip({ currentTaskId, onResumeTask, onOpenModule }: RecentContextStripProps) {
  const recent = getRecentTasks().filter((t) => t.taskId !== currentTaskId);
  const unfinished = getUnfinishedActions();
  const modules = getRecentModules();

  if (recent.length === 0 && unfinished.length === 0 && modules.length === 0) return null;

  return (
    <div className="recent-context-strip">
      <div className="flex flex-wrap items-center gap-1.5">
        {unfinished.map((u) => (
          <button
            key={u.taskId}
            type="button"
            className="recent-context-chip recent-context-warning"
            onClick={() => onResumeTask(u.taskId)}
          >
            ⚠ {u.actionLabel.slice(0, 24)}
          </button>
        ))}
        {recent.slice(0, 3).map((t) => (
          <button
            key={t.taskId}
            type="button"
            className={t.interrupted ? 'recent-context-chip recent-context-primary' : 'recent-context-chip'}
            onClick={() => onResumeTask(t.taskId)}
          >
            {t.interrupted ? '↩ ' : ''}
            {t.title.slice(0, 28)}
          </button>
        ))}
        {modules.slice(0, 2).map((m) => (
          <button
            key={m.moduleId}
            type="button"
            className="recent-context-chip recent-context-module"
            onClick={() => onOpenModule?.(m.moduleId)}
          >
            {m.moduleName.slice(0, 20)}
          </button>
        ))}
      </div>
    </div>
  );
}
