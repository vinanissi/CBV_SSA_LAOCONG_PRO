import { useCallback, useMemo, useState } from 'react';
import { api } from '@/api/client';
import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { useInlineExecution } from '@/modules/task/useInlineExecution';
import { formatInlineActionNote } from '@/shared/utils/inlineExecution';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';
import { getHandoffNote, type HandoffTarget } from '@/shared/utils/handoffQuickActions';
import { showFocusRuntimeFeedback } from '@/modules/task/inbox/focusRuntime/focusRuntimeFeedback';

const FOCUS_FORWARD_TARGET: HandoffTarget = {
  id: 'focus-handoff',
  label: 'Chuyển xử lý',
  targetCode: 'HANDOFF',
  status: 'WAITING',
  pendingNote: 'Chờ chuyển xử lý',
};

const PERMISSION_DENIED_MSG = 'Bạn không có quyền thao tác việc này';

export type FocusPendingAction = 'primary' | 'complete' | 'pause' | 'forward';

function mapApiError(message: string | undefined, fallback: string): string {
  const msg = message?.trim() ?? '';
  if (msg.includes('Không có quyền')) return PERMISSION_DENIED_MSG;
  return msg || fallback;
}

function taskNeedsAccept(task: TaskItem): boolean {
  const st = String(task.status ?? '').toUpperCase();
  return st === 'NEW' || st === 'OPEN' || st === 'TODO';
}

export function focusPrimaryLabel(task: TaskItem | undefined): string {
  if (!task) return 'Mở chi tiết';
  return taskNeedsAccept(task) ? 'Bắt đầu xử lý' : 'Mở chi tiết';
}

export interface UseFocusTaskActionsOptions {
  tasks: TaskItem[];
  onTaskUpdated: (task: import('@/api/contracts').TaskDetail) => void;
  onRefresh: () => void;
  onOpenItem: (item: WorkInboxFocusItem) => void;
  operatorId?: string;
}

export function useFocusTaskActions({
  tasks,
  onTaskUpdated,
  onRefresh,
  onOpenItem,
  operatorId,
}: UseFocusTaskActionsOptions) {
  const [pending, setPending] = useState<{ taskId: string; action: FocusPendingAction } | null>(null);

  const taskById = useMemo(() => {
    const map = new Map<string, TaskItem>();
    for (const t of tasks) {
      if (t.taskId) map.set(t.taskId, t);
    }
    return map;
  }, [tasks]);

  const resolveTask = useCallback(
    (item: WorkInboxFocusItem): TaskItem | null => taskById.get(item.id) ?? null,
    [taskById],
  );

  const { runHandoff } = useInlineExecution({ onTaskUpdated, onRefresh, operatorId });

  const runPending = useCallback(
    async (
      item: WorkInboxFocusItem,
      action: FocusPendingAction,
      fn: (task: TaskItem) => Promise<{ ok: true } | { ok: false; error: string; traceId?: string }>,
    ) => {
      const task = resolveTask(item);
      if (!task) {
        showFocusRuntimeFeedback('Không tìm thấy việc trong snapshot — thử làm mới');
        return;
      }
      setPending({ taskId: item.id, action });
      try {
        const result = await fn(task);
        if (!result.ok) {
          showFocusRuntimeFeedback(mapApiError(result.error, FEEDBACK_COPY.error.generic));
          return;
        }
        onRefresh();
        showFocusRuntimeFeedback(
          action === 'complete'
            ? FEEDBACK_COPY.success.complete
            : action === 'pause'
              ? 'Đã tạm dừng việc.'
              : action === 'forward'
                ? 'Đã chuyển trạng thái chờ xử lý (chưa đổi người phụ trách).'
                : FEEDBACK_COPY.success.generic,
        );
      } finally {
        setPending((prev) => (prev?.taskId === item.id && prev.action === action ? null : prev));
      }
    },
    [resolveTask, onRefresh],
  );

  const onFocusComplete = useCallback(
    async (item: WorkInboxFocusItem) => {
      if (!item.canComplete) return;
      await runPending(item, 'complete', async (task) => {
        const res = await api.completeTask(task.taskId, 'Hoàn tất từ Focus Mode');
        if (!res.ok) return { ok: false, error: res.errors[0], traceId: res.traceId };
        if (res.data?.task) onTaskUpdated(res.data.task as import('@/api/contracts').TaskDetail);
        return { ok: true };
      });
    },
    [runPending, onTaskUpdated],
  );

  const onFocusPause = useCallback(
    async (item: WorkInboxFocusItem) => {
      if (!item.canPause) return;
      await runPending(item, 'pause', async (task) => {
        const note = `${formatInlineActionNote('WAIT_CUSTOMER')} — Focus: tạm dừng thủ công`;
        const res = await api.updateTaskStatus(task.taskId, 'WAITING', note);
        if (!res.ok) return { ok: false, error: res.errors[0], traceId: res.traceId };
        if (res.data?.task) onTaskUpdated(res.data.task as import('@/api/contracts').TaskDetail);
        return { ok: true };
      });
    },
    [runPending, onTaskUpdated],
  );

  const onFocusForward = useCallback(
    async (item: WorkInboxFocusItem) => {
      if (!item.canForward) return;
      await runPending(item, 'forward', async (task) => {
        const outcome = await runHandoff(task, FOCUS_FORWARD_TARGET);
        if (!outcome.ok) return { ok: false, error: outcome.error, traceId: outcome.traceId };
        return { ok: true };
      });
    },
    [runPending, runHandoff],
  );

  const onFocusPrimary = useCallback(
    async (item: WorkInboxFocusItem) => {
      const task = resolveTask(item);
      if (!task) {
        onOpenItem(item);
        return;
      }
      if (taskNeedsAccept(task)) {
        setPending({ taskId: item.id, action: 'primary' });
        try {
          const note = formatInlineActionNote('ACCEPT');
          const res = await api.updateTaskStatus(task.taskId, 'IN_PROGRESS', note);
          if (!res.ok) {
            showFocusRuntimeFeedback(mapApiError(res.errors[0], FEEDBACK_COPY.error.accept));
            return;
          }
          if (res.data?.task) onTaskUpdated(res.data.task as import('@/api/contracts').TaskDetail);
          onRefresh();
        } finally {
          setPending((prev) => (prev?.taskId === item.id && prev.action === 'primary' ? null : prev));
        }
      }
      onOpenItem(item);
    },
    [resolveTask, onOpenItem, onTaskUpdated, onRefresh],
  );

  const isFocusActionPending = useCallback(
    (taskId: string, action: FocusPendingAction) =>
      pending?.taskId === taskId && pending.action === action,
    [pending],
  );

  return {
    onFocusPrimary,
    onFocusComplete,
    onFocusPause,
    onFocusForward,
    isFocusActionPending,
    focusPending: pending,
    focusPrimaryLabel,
    resolveTask,
    forwardHandoffNote: getHandoffNote(operatorId ?? 'OPERATOR', FOCUS_FORWARD_TARGET),
  };
}
