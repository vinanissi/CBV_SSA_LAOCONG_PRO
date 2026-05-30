import { useCallback } from 'react';
import { api } from '@/api/client';
import type { TaskDetail, TaskItem } from '@/api/contracts';
import { appendExecutionLog, formatInlineActionNote } from '@/shared/utils/inlineExecution';
import { type QuickAction, type QuickActionId, quickActionToNextActionType } from '@/shared/utils/quickActionRuntime';
import { formatMicroUpdateNote, type MicroUpdateOption } from '@/shared/utils/microUpdateFlow';
import { getHandoffNote, type HandoffTarget } from '@/shared/utils/handoffQuickActions';
import { markActionStarted, clearUnfinishedAction } from '@/shared/utils/taskContinuation';
import { recordUnfinishedAction, recordAbandonedAction } from '@/shared/utils/taskOperatorObservation';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';

export interface UseInlineExecutionOptions {
  onTaskUpdated?: (task: TaskDetail) => void;
  onRefresh?: () => void;
  operatorId?: string;
}

export type InlineExecMode = 'micro' | 'handoff' | 'done';

export type InlineExecOutcome =
  | { ok: true; mode: InlineExecMode; localOnly?: boolean; message?: string }
  | { ok: false; error: string; traceId?: string };

function apiError(res: { ok: boolean; errors: string[]; traceId?: string }, fallback: string): InlineExecOutcome {
  return { ok: false, error: res.errors[0] ?? fallback, traceId: res.traceId };
}

export function useInlineExecution({ onTaskUpdated, onRefresh, operatorId = 'OPERATOR' }: UseInlineExecutionOptions) {
  const runQuickAction = useCallback(
    async (task: TaskItem, action: QuickAction): Promise<InlineExecOutcome> => {
      const taskId = task.taskId;

      switch (action.id) {
        case 'ACCEPT': {
          const note = formatInlineActionNote('ACCEPT');
          appendExecutionLog({ taskId, kind: 'INLINE_ACTION', action: 'ACCEPT', meta: note });
          const res = await api.updateTaskStatus(taskId, 'IN_PROGRESS', note);
          if (!res.ok) return apiError(res, FEEDBACK_COPY.error.accept);
          if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
          onRefresh?.();
          return { ok: true, mode: 'done' };
        }
        case 'CALL':
        case 'FOLLOW':
        case 'CONFIRM': {
          markActionStarted(task, { type: quickActionToNextActionType(action.id), label: action.label });
          recordUnfinishedAction(taskId, quickActionToNextActionType(action.id));
          appendExecutionLog({
            taskId,
            kind: 'INLINE_ACTION',
            action: action.id,
            meta: formatInlineActionNote(action.id, 'STARTED'),
          });
          return {
            ok: true,
            mode: 'micro',
            localOnly: true,
            message: FEEDBACK_COPY.localOnly.callFollow,
          };
        }
        case 'COMPLETE':
          return { ok: true, mode: 'micro' };
        case 'HANDOFF':
          return { ok: true, mode: 'handoff' };
        case 'WAIT_CUSTOMER': {
          const note = formatInlineActionNote('WAIT_CUSTOMER');
          appendExecutionLog({ taskId, kind: 'STATUS', action: 'WAITING', meta: note });
          const res = await api.updateTaskStatus(taskId, 'WAITING', `${note} — Chờ khách phản hồi`);
          if (!res.ok) return apiError(res, FEEDBACK_COPY.error.update);
          if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
          onRefresh?.();
          return { ok: true, mode: 'done' };
        }
        case 'WAIT_APPROVAL': {
          const note = formatInlineActionNote('WAIT_APPROVAL');
          appendExecutionLog({ taskId, kind: 'STATUS', action: 'WAITING_APPROVAL', meta: note });
          const res = await api.updateTaskStatus(taskId, 'WAITING_APPROVAL', `${note} — Chờ duyệt`);
          if (!res.ok) return apiError(res, FEEDBACK_COPY.error.update);
          if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
          onRefresh?.();
          return { ok: true, mode: 'done' };
        }
        case 'CONTINUE':
        case 'RESCHEDULE': {
          const note = formatInlineActionNote(action.id);
          appendExecutionLog({ taskId, kind: 'INLINE_ACTION', action: action.id, meta: note });
          const res = await api.addTaskComment(taskId, note);
          if (!res.ok) return apiError(res, FEEDBACK_COPY.error.update);
          if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
          onRefresh?.();
          return { ok: true, mode: 'done' };
        }
        default:
          return { ok: true, mode: 'done' };
      }
    },
    [onTaskUpdated, onRefresh],
  );

  const runMicroUpdate = useCallback(
    async (task: TaskItem, actionId: QuickActionId | string, option: MicroUpdateOption): Promise<InlineExecOutcome> => {
      const taskId = task.taskId;

      if (actionId === 'COMPLETE' && option.id === 'done') {
        const note = formatMicroUpdateNote('COMPLETE', option);
        appendExecutionLog({ taskId, kind: 'MICRO_UPDATE', action: 'COMPLETE', meta: note });
        clearUnfinishedAction(taskId);
        const res = await api.completeTask(taskId, note);
        if (!res.ok) return apiError(res, FEEDBACK_COPY.error.complete);
        if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
        onRefresh?.();
        return { ok: true, mode: 'done' };
      }

      if (actionId === 'COMPLETE' && option.id === 'not_done') {
        recordAbandonedAction(taskId, 'COMPLETE');
        clearUnfinishedAction(taskId);
        return { ok: true, mode: 'done' };
      }

      const note = formatMicroUpdateNote(String(actionId), option);
      appendExecutionLog({ taskId, kind: 'MICRO_UPDATE', action: String(actionId), meta: note });
      clearUnfinishedAction(taskId);
      const res = await api.addTaskComment(taskId, option.note || note);
      if (!res.ok) return apiError(res, FEEDBACK_COPY.error.update);
      if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
      onRefresh?.();
      return { ok: true, mode: 'done' };
    },
    [onTaskUpdated, onRefresh],
  );

  const runHandoff = useCallback(
    async (task: TaskItem, target: HandoffTarget): Promise<InlineExecOutcome> => {
      const taskId = task.taskId;
      const from = task.ownerId || task.owner || operatorId;
      const note = `${getHandoffNote(from, target)} — ${target.pendingNote ?? target.label}`;
      appendExecutionLog({
        taskId,
        kind: 'INLINE_HANDOFF',
        action: target.targetCode,
        meta: note,
      });
      const status = target.status ?? 'WAITING';
      const res = await api.updateTaskStatus(taskId, status, note);
      if (!res.ok) return apiError(res, FEEDBACK_COPY.error.update);
      if (res.data?.task) onTaskUpdated?.(res.data.task as TaskDetail);
      onRefresh?.();
      return { ok: true, mode: 'done' };
    },
    [onTaskUpdated, onRefresh, operatorId],
  );

  return { runQuickAction, runMicroUpdate, runHandoff };
}
