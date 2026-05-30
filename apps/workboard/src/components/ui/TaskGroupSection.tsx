import { memo, useState, useEffect, type ReactNode } from 'react';
import type { TaskItem } from '@/api/contracts';
import { TaskCard } from '@/components/ui/TaskCard';
import type { SignalCollapseContext } from '@/shared/utils/signalCollapse';
import type { TaskGroup } from '@/shared/utils/taskGrouping';
import type { QuickAction, QuickActionId } from '@/shared/utils/quickActionRuntime';
import type { MicroUpdateOption } from '@/shared/utils/microUpdateFlow';
import type { HandoffTarget } from '@/shared/utils/handoffQuickActions';
import type { RuntimeFeedback } from '@/shared/utils/runtimeFeedback';

export interface InlineExecState {
  taskId: string;
  mode: 'micro' | 'handoff';
  actionId: QuickActionId | string;
}

export interface InlineExecHandlers {
  onQuickAction: (task: TaskItem, action: QuickAction) => void;
  onMicroUpdate: (task: TaskItem, actionId: QuickActionId | string, option: MicroUpdateOption) => void;
  onHandoff: (task: TaskItem, target: HandoffTarget) => void;
  onExecDismiss: (task: TaskItem) => void;
}

interface TaskGroupSectionProps {
  group: TaskGroup;
  focusedTaskId?: string | null;
  selectedIndex?: number;
  flatOffset?: number;
  defaultCollapsed?: boolean;
  suppressSignals?: boolean;
  focusQueueMode?: boolean;
  overloadedOwnerIds?: Set<string>;
  signalContext?: SignalCollapseContext;
  inlineExec?: InlineExecState | null;
  inlineHandlers?: InlineExecHandlers;
  onOpen: (task: TaskItem) => void;
  onAccept: (task: TaskItem) => void;
  onComplete: (task: TaskItem) => void;
  onHoSo?: (task: TaskItem) => void;
  getTaskFeedback?: (taskId: string) => RuntimeFeedback;
  isActionPending?: (taskId: string, action: string) => boolean;
}

export const TaskGroupSection = memo(function TaskGroupSection({
  group,
  focusedTaskId,
  selectedIndex = -1,
  flatOffset = 0,
  defaultCollapsed,
  suppressSignals,
  focusQueueMode,
  overloadedOwnerIds,
  signalContext,
  inlineExec,
  inlineHandlers,
  onOpen,
  onAccept,
  onComplete,
  onHoSo,
  getTaskFeedback,
  isActionPending,
}: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? group.defaultCollapsed ?? false);

  useEffect(() => {
    if (focusedTaskId && group.tasks.some((t) => t.taskId === focusedTaskId)) {
      setCollapsed(false);
    }
  }, [focusedTaskId, group.tasks]);

  return (
    <section className="task-group-section">
      <button
        type="button"
        className="task-group-header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <span className="text-slate-700">{collapsed ? '▸' : '▾'}</span>
          <span>{group.label}</span>
          <span className="task-group-count">{group.tasks.length}</span>
        </span>
      </button>
      {!collapsed && (
        <div className="task-group-body">
          {group.tasks.map((task, idx) => {
            const flatIdx = flatOffset + idx;
            const isFocused = focusedTaskId === task.taskId;
            const isKeyboardSelected = selectedIndex === flatIdx;
            return (
              <TaskCard
                key={task.taskId}
                task={task}
                selected={isFocused || isKeyboardSelected}
                focused={isFocused}
                dimmed={Boolean(focusedTaskId && !isFocused)}
                suppressSignals={suppressSignals}
                focusQueueMode={focusQueueMode}
                ownerOverloaded={Boolean(task.ownerId && overloadedOwnerIds?.has(task.ownerId))}
                signalContext={signalContext}
                execMode={inlineExec && inlineExec.taskId === task.taskId ? inlineExec.mode : null}
                execActionId={inlineExec && inlineExec.taskId === task.taskId ? inlineExec.actionId : undefined}
                onQuickAction={inlineHandlers?.onQuickAction}
                onMicroUpdate={inlineHandlers?.onMicroUpdate}
                onHandoff={inlineHandlers?.onHandoff}
                onExecDismiss={inlineHandlers?.onExecDismiss}
                onOpen={onOpen}
                onAccept={onAccept}
                onComplete={onComplete}
                onHoSo={onHoSo}
                actionFeedback={getTaskFeedback?.(task.taskId)}
                isAcceptPending={isActionPending?.(task.taskId, 'accept')}
                isCompletePending={isActionPending?.(task.taskId, 'complete')}
              />
            );
          })}
        </div>
      )}
    </section>
  );
});

interface TaskGroupedListProps {
  groups: TaskGroup[];
  focusedTaskId?: string | null;
  selectedIndex?: number;
  suppressSignals?: boolean;
  focusQueueMode?: boolean;
  overloadedOwnerIds?: Set<string>;
  signalContext?: SignalCollapseContext;
  inlineExec?: InlineExecState | null;
  inlineHandlers?: InlineExecHandlers;
  onOpen: (task: TaskItem) => void;
  onAccept: (task: TaskItem) => void;
  onComplete: (task: TaskItem) => void;
  onHoSo?: (task: TaskItem) => void;
  header?: ReactNode;
  getTaskFeedback?: (taskId: string) => RuntimeFeedback;
  isActionPending?: (taskId: string, action: string) => boolean;
}

export function TaskGroupedList({
  groups,
  focusedTaskId,
  selectedIndex = -1,
  suppressSignals,
  focusQueueMode,
  overloadedOwnerIds,
  signalContext,
  inlineExec,
  inlineHandlers,
  onOpen,
  onAccept,
  onComplete,
  onHoSo,
  header,
  getTaskFeedback,
  isActionPending,
}: TaskGroupedListProps) {
  let offset = 0;
  return (
    <div className="panel flex flex-col overflow-hidden">
      {header && <div className="panel-header py-2">{header}</div>}
      <div className="divide-y divide-border/40">
        {groups.map((group) => {
          const section = (
            <TaskGroupSection
              key={group.key}
              group={group}
              focusedTaskId={focusedTaskId}
              selectedIndex={selectedIndex}
              flatOffset={offset}
              suppressSignals={suppressSignals}
              focusQueueMode={focusQueueMode}
              overloadedOwnerIds={overloadedOwnerIds}
              signalContext={signalContext}
              inlineExec={inlineExec}
              inlineHandlers={inlineHandlers}
              onOpen={onOpen}
              onAccept={onAccept}
              onComplete={onComplete}
              onHoSo={onHoSo}
              getTaskFeedback={getTaskFeedback}
              isActionPending={isActionPending}
            />
          );
          offset += group.tasks.length;
          return section;
        })}
      </div>
    </div>
  );
}
