import { memo, useMemo } from 'react';
import type { TaskFilter } from '@/api/contracts';
import { TASK_FILTER_TABS } from '@/shared/constants/taskFilterKeys';
import type { GroupMode } from '@/shared/utils/workingContext';
import type { QuickFocusFilter } from '@/shared/utils/quickFocusFilters';
import type { OwnerPressure } from '@/shared/utils/teamPressure';
import { GroupModeSelect } from './GroupModeSelect';
import { QuickFocusFilters } from './QuickFocusFilters';
import { getExecutionMemorySummary } from '@/shared/utils/executionMemory';
import { buildResumeFlowSnapshot } from '@/shared/utils/flowResume';
import { getRecentTasks } from '@/shared/utils/recentContext';
import { recordResumeFlow } from '@/shared/utils/taskOperatorObservation';

interface TaskControlSurfaceProps {
  activeFilter: TaskFilter;
  groupMode: GroupMode;
  quickFocus: QuickFocusFilter;
  teamPressure?: OwnerPressure[];
  focusQueueMode?: boolean;
  currentTaskId?: string | null;
  execMemoryTick?: number;
  filterFeedback?: string | null;
  queueSummary?: string;
  onFilterChange: (f: TaskFilter) => void;
  onGroupModeChange: (mode: GroupMode) => void;
  onQuickFocusChange: (focus: QuickFocusFilter) => void;
  onFocusQueueModeChange?: (next: boolean) => void;
  onResumeTask?: (taskId: string) => void;
}

export const TaskControlSurface = memo(function TaskControlSurface({
  activeFilter,
  groupMode,
  quickFocus,
  teamPressure,
  focusQueueMode = false,
  currentTaskId,
  execMemoryTick = 0,
  filterFeedback,
  queueSummary,
  onFilterChange,
  onGroupModeChange,
  onQuickFocusChange,
  onFocusQueueModeChange,
  onResumeTask,
}: TaskControlSurfaceProps) {
  const execSummary = useMemo(() => getExecutionMemorySummary(), [execMemoryTick]);
  const resumeSnap = useMemo(() => buildResumeFlowSnapshot(), [execMemoryTick]);
  const recent = useMemo(
    () => getRecentTasks().filter((t) => t.taskId !== currentTaskId),
    [execMemoryTick, currentTaskId],
  );
  const resumePrimary = resumeSnap.canResume ? resumeSnap.items[0] : null;

  const hasContextRow =
    !focusQueueMode &&
    (execSummary.count > 0 || resumePrimary != null || recent.length > 0);

  return (
    <div className={`operational-control-strip ${focusQueueMode ? 'operational-control-focus' : ''}`}>
      {(filterFeedback || queueSummary) && (
        <div className="operational-control-feedback" role="status" aria-live="polite">
          {filterFeedback && <span className="operational-filter-feedback">{filterFeedback}</span>}
          {queueSummary && !filterFeedback && (
            <span className="operational-queue-summary">{queueSummary}</span>
          )}
        </div>
      )}

      <div className="operational-control-primary">
        <div className="task-control-primary" role="tablist" aria-label="Bộ lọc việc chính">
          {TASK_FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-filter={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={`task-filter-tab${isActive ? ' task-filter-tab-active' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="operational-control-divider" aria-hidden />

        <GroupModeSelect mode={groupMode} onChange={onGroupModeChange} />

        <QuickFocusFilters focus={quickFocus} onChange={onQuickFocusChange} pressure={teamPressure} />

        {onFocusQueueModeChange && (
          <button
            type="button"
            title="Focus queue — ẩn việc nền, giữ signal thực thi"
            aria-pressed={focusQueueMode}
            onClick={() => onFocusQueueModeChange(!focusQueueMode)}
            className={`focus-queue-toggle${focusQueueMode ? ' focus-queue-toggle-active' : ''}`}
          >
            ◎ Focus
          </button>
        )}
      </div>

      {hasContextRow && (
        <div className="operational-control-context">
          {resumePrimary && onResumeTask && (
            <button
              type="button"
              className="operational-context-chip operational-context-primary"
              onClick={() => {
                recordResumeFlow(resumePrimary.taskId);
                if (resumePrimary.taskId) onResumeTask(resumePrimary.taskId);
              }}
            >
              ↩ {resumePrimary.label.slice(0, 28)}
            </button>
          )}
          {execSummary.count > 0 && execSummary.message && (
            <span className="operational-context-chip operational-context-warning" role="status">
              ⚠ {execSummary.message}
              {execSummary.count <= 2 &&
                execSummary.items.map((item) => (
                  <button
                    key={item.taskId}
                    type="button"
                    className="operational-context-link"
                    onClick={() => onResumeTask?.(item.taskId)}
                  >
                    {item.title.slice(0, 20)}
                  </button>
                ))}
            </span>
          )}
          {recent.slice(0, 2).map((t) => (
            <button
              key={t.taskId}
              type="button"
              className={t.interrupted ? 'operational-context-chip operational-context-primary' : 'operational-context-chip'}
              onClick={() => onResumeTask?.(t.taskId)}
            >
              {t.interrupted ? '↩ ' : ''}
              {t.title.slice(0, 24)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
