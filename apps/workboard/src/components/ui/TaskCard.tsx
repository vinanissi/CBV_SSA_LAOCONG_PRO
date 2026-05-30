import { memo, useMemo, useState } from 'react';
import type { TaskItem } from '@/api/contracts';
import { getTaskNextAction, getNextActionChipClass } from '@/shared/utils/taskNextAction';
import { useRenderCount } from '@/shared/utils/renderPerf';
import {
  collapseTaskSignals,
  hasViewedTaskSignal,
  type SignalCollapseContext,
} from '@/shared/utils/signalCollapse';
import {
  getLegacyAttentionCardClass,
  shouldShowNextActionChip,
  shortenNextActionLabel,
} from '@/shared/utils/visualPriority';
import { resolveCardHotSignalClass } from '@/shared/utils/hotSignalRuntime';
import { buildCompactCardLine } from '@/shared/utils/informationBalance';
import { effectiveDisclosureMode } from '@/shared/utils/scanRhythm';
import { InlineQuickActions } from '@/components/ui/InlineQuickActions';
import { MicroUpdateStrip } from '@/components/ui/MicroUpdateStrip';
import { InlineHandoffStrip } from '@/components/ui/InlineHandoffStrip';
import { getTaskOwnerTechnicalId } from '@/runtime/userDisplay';
import { hasPendingExecution } from '@/shared/utils/executionMemory';
import type { QuickAction, QuickActionId } from '@/shared/utils/quickActionRuntime';
import type { MicroUpdateOption } from '@/shared/utils/microUpdateFlow';
import type { HandoffTarget } from '@/shared/utils/handoffQuickActions';
import type { RuntimeFeedback } from '@/shared/utils/runtimeFeedback';
import { RuntimeInlineStatus } from '@/components/ui/RuntimeInlineStatus';

interface TaskCardProps {
  task: TaskItem;
  selected?: boolean;
  focused?: boolean;
  dimmed?: boolean;
  compact?: boolean;
  suppressSignals?: boolean;
  focusQueueMode?: boolean;
  ownerOverloaded?: boolean;
  signalContext?: SignalCollapseContext;
  execMode?: 'micro' | 'handoff' | null;
  execActionId?: QuickActionId | string;
  onOpen?: (task: TaskItem) => void;
  onAccept?: (task: TaskItem) => void;
  onComplete?: (task: TaskItem) => void;
  onQuickAction?: (task: TaskItem, action: QuickAction) => void;
  onMicroUpdate?: (task: TaskItem, actionId: QuickActionId | string, option: MicroUpdateOption) => void;
  onHandoff?: (task: TaskItem, target: HandoffTarget) => void;
  onExecDismiss?: (task: TaskItem) => void;
  onHoSo?: (task: TaskItem) => void;
  onTimeline?: (task: TaskItem) => void;
  onSelect?: (task: TaskItem) => void;
  actionFeedback?: RuntimeFeedback;
  isAcceptPending?: boolean;
  isCompletePending?: boolean;
}

export const TaskCard = memo(function TaskCard({
  task,
  selected,
  focused,
  dimmed,
  compact = true,
  suppressSignals = false,
  focusQueueMode = false,
  ownerOverloaded,
  signalContext,
  execMode,
  execActionId,
  onOpen,
  onAccept,
  onComplete,
  onQuickAction,
  onMicroUpdate,
  onHandoff,
  onExecDismiss,
  onSelect,
  actionFeedback,
  isAcceptPending,
  isCompletePending,
}: TaskCardProps) {
  useRenderCount('TaskCard');
  const openHandler = onOpen ?? onSelect;
  const nextAction = getTaskNextAction(task);
  const isFocused = focused ?? selected;
  const [hovered, setHovered] = useState(false);
  const disclosure = effectiveDisclosureMode(Boolean(isFocused), hovered, Boolean(selected), focusQueueMode);
  const showActions = Boolean(onQuickAction) && (isFocused || hovered || execMode);
  const pending = hasPendingExecution(task.taskId);

  const collapsed = useMemo(() => {
    if (suppressSignals) {
      return collapseTaskSignals(task, { ownerOverloaded });
    }
    return collapseTaskSignals(task, {
      ...signalContext,
      ownerOverloaded,
      viewed: hasViewedTaskSignal(task.taskId),
    });
  }, [task, suppressSignals, ownerOverloaded, signalContext]);

  const compactLine = useMemo(
    () => buildCompactCardLine(task, collapsed, disclosure === 'expanded', focusQueueMode),
    [task, collapsed, disclosure, focusQueueMode],
  );

  const hotSignalClass = suppressSignals
    ? 'task-signal-neutral'
    : resolveCardHotSignalClass(collapsed, suppressSignals);
  const showNextChip = !suppressSignals && !focusQueueMode && shouldShowNextActionChip(collapsed, nextAction.priority);

  const operationalLine =
    compactLine.line ||
    (!showNextChip && !focusQueueMode && nextAction.priority !== 'LOW' ? shortenNextActionLabel(nextAction.label) : '');

  const showOperationalLine = Boolean(operationalLine) && !(focusQueueMode && !collapsed.primary);

  if (!compact) {
    return (
      <article
        id={`task-card-${task.taskId}`}
        tabIndex={0}
        role="button"
        onClick={() => openHandler?.(task)}
        className={`panel w-full p-4 ${hotSignalClass} ${isFocused ? 'border-accent ring-1 ring-accent/25' : ''} ${dimmed ? 'opacity-45' : ''}`}
      >
        <h3 className="task-card-title text-lg">{task.title}</h3>
        {showOperationalLine && <p className="task-card-operational-line mt-1">{operationalLine}</p>}
        {onQuickAction && (
          <div className="mt-2">
            <InlineQuickActions task={task} visible onAction={onQuickAction} compact={false} />
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      id={`task-card-${task.taskId}`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !execMode) openHandler?.(task);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group task-card-compact task-card-scan-row task-card-executable ${hotSignalClass} ${suppressSignals ? getLegacyAttentionCardClass(task) : ''} ${isFocused ? 'task-card-focused' : ''} ${dimmed ? 'task-card-dimmed' : ''} ${pending ? 'task-card-pending-exec' : ''} ${focusQueueMode ? 'task-card-focus-mode' : ''}`}
    >
      <div className="task-card-row">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openHandler?.(task)}>
          <div className="flex min-w-0 items-center gap-1.5">
            {showNextChip && (
              <span className={getNextActionChipClass(nextAction.priority)} title={nextAction.type}>
                {shortenNextActionLabel(nextAction.label)}
              </span>
            )}
            <h3 className="task-card-title">{task.title}</h3>
          </div>
          {showOperationalLine && (
            <p
              className="task-card-operational-line"
              title={
                compactLine.suppressedTooltip ||
                getTaskOwnerTechnicalId(task) ||
                undefined
              }
            >
              {operationalLine}
            </p>
          )}
        </button>

        <div className="task-card-action-zone">
          {!showActions ? (
            <>
              {nextAction.type === 'ACCEPT' && onAccept ? (
                <button
                  type="button"
                  title={nextAction.label}
                  aria-label={nextAction.label}
                  disabled={isAcceptPending}
                  className="task-action-slot inline-action-btn inline-action-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAcceptPending) onAccept(task);
                  }}
                >
                  {isAcceptPending ? '…' : '▶'}
                </button>
              ) : (
                <span className="task-action-slot task-action-slot-empty" aria-hidden />
              )}
              {task.status !== 'DONE' && onComplete && nextAction.type !== 'ACCEPT' ? (
                <button
                  type="button"
                  title="Hoàn tất"
                  aria-label="Hoàn tất việc"
                  disabled={isCompletePending}
                  className="task-action-slot inline-action-btn inline-action-passive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompletePending) onComplete(task);
                  }}
                >
                  {isCompletePending ? '…' : '✓'}
                </button>
              ) : (
                <span className="task-action-slot task-action-slot-empty" aria-hidden />
              )}
              <button
                type="button"
                title="Mở chi tiết"
                className="task-action-slot task-action-icon task-action-open"
                onClick={(e) => {
                  e.stopPropagation();
                  openHandler?.(task);
                }}
              >
                →
              </button>
            </>
          ) : (
            <span className="task-action-slot task-action-slot-empty" aria-hidden />
          )}
        </div>
      </div>

      {showActions && onQuickAction && (
        <InlineQuickActions task={task} visible onAction={onQuickAction} />
      )}

      {execMode === 'micro' && execActionId && onMicroUpdate && (
        <MicroUpdateStrip
          actionId={execActionId}
          onSelect={(opt) => onMicroUpdate(task, execActionId, opt)}
          onDismiss={() => onExecDismiss?.(task)}
        />
      )}

      {execMode === 'handoff' && onHandoff && (
        <InlineHandoffStrip
          onSelect={(t) => onHandoff(task, t)}
          onDismiss={() => onExecDismiss?.(task)}
        />
      )}

      <RuntimeInlineStatus feedback={actionFeedback} />
    </article>
  );
});
