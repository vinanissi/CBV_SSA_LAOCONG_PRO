import type { TaskItem } from '@/api/contracts';
import { getQuickActionsForTask, type QuickAction, type QuickActionId } from '@/shared/utils/quickActionRuntime';
import { filterQuickActionsByIdentity } from '@/runtime/runtimeIdentity';
import { hasPendingExecution } from '@/shared/utils/executionMemory';

interface InlineQuickActionsProps {
  task: TaskItem;
  visible?: boolean;
  compact?: boolean;
  onAction: (task: TaskItem, action: QuickAction) => void;
}

const PASSIVE_ACTIONS = new Set<QuickActionId>(['COMPLETE']);

function getInlineActionClass(action: QuickAction): string {
  if (action.primary) return 'inline-action-btn inline-action-primary';
  if (PASSIVE_ACTIONS.has(action.id)) return 'inline-action-btn inline-action-passive';
  return 'inline-action-btn inline-action-secondary';
}

export function InlineQuickActions({ task, visible = true, compact = true, onAction }: InlineQuickActionsProps) {
  if (!visible || task.status === 'DONE') return null;

  const actions = filterQuickActionsByIdentity(getQuickActionsForTask(task));
  const pending = hasPendingExecution(task.taskId);

  return (
    <div className={`inline-quick-actions ${compact ? 'inline-quick-actions-compact' : ''}`} onClick={(e) => e.stopPropagation()}>
      {pending && <span className="inline-exec-pending-dot" title="Chưa cập nhật kết quả" />}
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={getInlineActionClass(action)}
          title={action.label}
          onClick={(e) => {
            e.stopPropagation();
            onAction(task, action);
          }}
        >
          {action.shortLabel}
        </button>
      ))}
    </div>
  );
}
