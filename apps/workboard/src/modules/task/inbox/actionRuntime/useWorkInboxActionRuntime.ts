import { useCallback, useRef, useState } from 'react';
import type { TaskDetail } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { useWorkInboxRuntimeContext } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import { showFocusRuntimeFeedback } from '../focusRuntime/focusRuntimeFeedback';
import { applyWorkInboxRefreshPlan, buildBundleOnlyRefreshPlan } from '../performance/workInboxRefreshPolicy';
import { ACTION_SLOW_SYNC_MS, ACTION_SLOW_SYNC_MESSAGE } from '../performance/workInboxRefreshPolicy';
import { executeWorkInboxAction } from './workInboxActionExecutor';
import type { WorkInboxActionCode } from './workInboxActionTypes';
import { focusPrimaryLabel } from '@/modules/task/useFocusTaskActions';

export type FocusPendingAction = 'primary' | 'complete' | 'pause' | 'forward' | 'handoff';

export interface UseWorkInboxActionRuntimeDeps {
  onTaskUpdated: (task: TaskDetail) => void;
  onSnapshotRefresh?: () => void;
  onOpenItem: (item: WorkInboxFocusItem) => void;
  onFocusIndexChange: (index: number) => void;
}

export function useWorkInboxActionRuntime(deps: UseWorkInboxActionRuntimeDeps) {
  const ctx = useWorkInboxRuntimeContext();
  const refreshOpRef = useRef(ctx.refreshOperational);
  refreshOpRef.current = ctx.refreshOperational;

  const triggerOperationalRefresh = useCallback(() => {
    refreshOpRef.current?.();
  }, []);
  const [pending, setPending] = useState<{ taskId: string; action: FocusPendingAction } | null>(null);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  const runAction = useCallback(
    async (code: WorkInboxActionCode, payload?: Record<string, string | undefined>) => {
      const item = ctx.currentFocusItem;
      const taskId = ctx.currentTask?.taskId ?? item?.id;
      if (!taskId) {
        showFocusRuntimeFeedback('Không có việc trong focus');
        return null;
      }
      const started = performance.now();
      const result = await executeWorkInboxAction(ctx, code, payload, {
        onTaskUpdated: deps.onTaskUpdated,
        onApplyRefreshPlan: (plan) => {
          applyWorkInboxRefreshPlan(plan, {
            onTaskUpdated: deps.onTaskUpdated,
            onSnapshotRefresh: deps.onSnapshotRefresh,
            onOperationalRefresh: triggerOperationalRefresh,
          });
        },
        onForceSnapshotRefresh: deps.onSnapshotRefresh,
      });
      const elapsed = performance.now() - started;
      if (!result.ok) {
        showFocusRuntimeFeedback(result.error ?? 'Lệnh chưa hoàn tất');
        return result;
      }
      if (result.message) {
        const msg =
          elapsed >= ACTION_SLOW_SYNC_MS
            ? `${result.message}. ${ACTION_SLOW_SYNC_MESSAGE}`
            : result.message;
        showFocusRuntimeFeedback(msg);
      }
      return result;
    },
    [
      ctx.currentFocusItem,
      ctx.currentTask,
      ctx.operator,
      ctx.permissions.ops,
      ctx.permissions.canAssign,
      deps,
      triggerOperationalRefresh,
    ],
  );

  const withPending = useCallback(
    async (action: FocusPendingAction, fn: () => Promise<void>) => {
      const id = ctx.currentFocusItem?.id;
      if (!id) return;
      setPending({ taskId: id, action });
      try {
        await fn();
      } finally {
        setPending((p) => (p?.taskId === id && p.action === action ? null : p));
      }
    },
    [ctx.currentFocusItem?.id],
  );

  const onFocusPrimary = useCallback(
    async (item: WorkInboxFocusItem) => {
      const task = ctx.tasks.find((t) => t.taskId === item.id);
      const needsStart =
        task &&
        ['NEW', 'OPEN', 'TODO'].includes(String(task.status ?? '').toUpperCase());
      if (needsStart) {
        await withPending('primary', async () => {
          await runAction('ACTION_START_PROCESSING');
        });
      }
      deps.onOpenItem(item);
    },
    [ctx.tasks, deps, runAction, withPending],
  );

  const onFocusPauseRequest = useCallback(() => {
    if (!ctx.currentFocusItem?.canPause || !ctx.permissions.ops.PAUSE) return;
    setPauseDialogOpen(true);
  }, [ctx.currentFocusItem, ctx.permissions.ops.PAUSE]);

  const onFocusPauseConfirm = useCallback(
    async (reasonLabel: string) => {
      setPauseDialogOpen(false);
      await withPending('pause', async () => {
        await runAction('ACTION_PAUSE_TASK', { reasonLabel });
      });
    },
    [runAction, withPending],
  );

  const onFocusForwardRequest = useCallback(() => {
    if (!ctx.currentFocusItem?.canForward) return;
    if (!ctx.permissions.canAssign) {
      showFocusRuntimeFeedback('Bạn không có quyền chuyển giao');
      return;
    }
    setHandoffDialogOpen(true);
  }, [ctx.currentFocusItem, ctx.permissions.canAssign]);

  const onFocusHandoffConfirm = useCallback(
    async (recipient: string, comment: string) => {
      setHandoffDialogOpen(false);
      await withPending('handoff', async () => {
        await runAction('ACTION_HANDOFF', { recipient, comment });
      });
    },
    [runAction, withPending],
  );

  const onFocusComplete = useCallback(
    async (item: WorkInboxFocusItem) => {
      if (!item.canComplete) return;
      await withPending('complete', async () => {
        await runAction('ACTION_COMPLETE_TASK');
      });
    },
    [runAction, withPending],
  );

  const onNavigatePrev = useCallback(() => {
    const idx = ctx.focusIndex;
    if (idx <= 0) return;
    const next = idx - 1;
    void runAction('ACTION_NAVIGATE_PREVIOUS');
    deps.onFocusIndexChange(next);
    const item = ctx.focusItems[next];
    if (item) deps.onOpenItem(item);
  }, [ctx.focusIndex, ctx.focusItems, deps, runAction]);

  const onNavigateNext = useCallback(() => {
    const idx = ctx.focusIndex;
    if (idx >= ctx.focusItems.length - 1) return;
    const next = idx + 1;
    void runAction('ACTION_NAVIGATE_NEXT');
    deps.onFocusIndexChange(next);
    const item = ctx.focusItems[next];
    if (item) deps.onOpenItem(item);
  }, [ctx.focusIndex, ctx.focusItems, deps, runAction]);

  const onMoreAction = useCallback(
    async (code: WorkInboxActionCode) => {
      setMoreMenuOpen(false);
      if (code === 'ACTION_MORE_COPY_LINK') {
        const id = ctx.currentFocusItem?.id;
        if (!id) return;
        const url = `${window.location.origin}/inbox/${encodeURIComponent(id)}`;
        try {
          await navigator.clipboard.writeText(url);
          showFocusRuntimeFeedback('Đã sao chép link');
        } catch {
          showFocusRuntimeFeedback(url);
        }
        return;
      }
      const result = await runAction(code);
      if (!result) showFocusRuntimeFeedback('Chức năng đang chuẩn bị');
    },
    [ctx.currentFocusItem?.id, runAction],
  );

  const onQuickCall = useCallback(async () => {
    const phone =
      (ctx.taskDetail as { phone?: string } | null)?.phone?.trim() ||
      (ctx.taskDetail as { contactPhone?: string } | null)?.contactPhone?.trim() ||
      '';
    if (!phone) {
      showFocusRuntimeFeedback('Chưa có số điện thoại');
      return;
    }
    await runAction('ACTION_CALL_CLICK', { phone });
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      /* ignore */
    }
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    }
  }, [ctx.taskDetail, runAction]);

  const onQuickMessage = useCallback(async () => {
    const phone =
      (ctx.taskDetail as { phone?: string } | null)?.phone?.trim() ||
      (ctx.taskDetail as { contactPhone?: string } | null)?.contactPhone?.trim() ||
      '';
    if (phone && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      await runAction('ACTION_MESSAGE_CLICK', { channel: 'sms' });
      window.location.href = `sms:${phone.replace(/\s/g, '')}`;
      return;
    }
    await runAction('ACTION_MESSAGE_CLICK', { channel: 'zalo' });
    showFocusRuntimeFeedback('Chức năng đang chuẩn bị — chưa có deep link Zalo');
  }, [ctx.taskDetail, runAction]);

  const onQuickAppointment = useCallback(() => {
    if (!ctx.permissions.ops.APPOINTMENT) {
      showFocusRuntimeFeedback('Bạn không có quyền tạo lịch hẹn');
      return;
    }
    setAppointmentDialogOpen(true);
  }, [ctx.permissions.ops.APPOINTMENT]);

  const onAppointmentConfirm = useCallback(
    async (data: { title: string; description: string; startAt: string; endAt: string }) => {
      setAppointmentDialogOpen(false);
      await withPending('pause', async () => {
        await runAction('ACTION_CREATE_APPOINTMENT', {
          title: data.title,
          description: data.description,
          startAt: data.startAt,
          endAt: data.endAt,
        });
      });
    },
    [runAction, withPending],
  );

  const onSaveNote = useCallback(
    async (content: string) => {
      if (!ctx.permissions.ops.NOTES) {
        showFocusRuntimeFeedback('Bạn không có quyền ghi chú');
        return;
      }
      const taskId = ctx.currentTask?.taskId ?? ctx.currentFocusItem?.id;
      if (!taskId || !content.trim()) return;

      const { isCombinedActionAvailable, recordWorkInboxCombinedAction } = await import(
        './workInboxCombinedActionClient'
      );
      if (isCombinedActionAvailable()) {
        const res = await recordWorkInboxCombinedAction({
          traceId: `wi-note-${Date.now()}`,
          action: 'SAVE_NOTE',
          taskId,
          actor: ctx.operator.userId || ctx.operator.displayName || 'OPERATOR',
          actorRole: ctx.operator.role,
          payload: { content: content.trim() },
        });
        if (res.ok) {
          showFocusRuntimeFeedback('Đã lưu ghi chú');
          applyWorkInboxRefreshPlan(buildBundleOnlyRefreshPlan(), {
            onOperationalRefresh: triggerOperationalRefresh,
          });
          return;
        }
      }

      const { workInboxOperationalApi } = await import('../operationalRuntime/workInboxOperationalApi');
      const res = await workInboxOperationalApi.saveNote(taskId, content.trim());
      if (!res.ok) {
        showFocusRuntimeFeedback(res.errors[0] ?? 'Không lưu được ghi chú');
        return;
      }
      showFocusRuntimeFeedback('Đã lưu ghi chú');
      applyWorkInboxRefreshPlan(buildBundleOnlyRefreshPlan(), {
        onOperationalRefresh: triggerOperationalRefresh,
      });
    },
    [ctx.permissions.ops, ctx.currentTask?.taskId, ctx.currentFocusItem?.id, ctx.operator, triggerOperationalRefresh],
  );

  const onQuickGuide = useCallback(async () => {
    const { workInboxOperationalApi } = await import('../operationalRuntime/workInboxOperationalApi');
    const status = ctx.currentTask?.status ?? ctx.currentFocusItem?.status ?? 'TASK';
    const res = await workInboxOperationalApi.lookupSop({
      module: 'WORK_INBOX',
      taskType: String(status),
    });
    if (res.ok && res.data?.sop?.url) {
      window.open(res.data.sop.url, '_blank', 'noopener,noreferrer');
      showFocusRuntimeFeedback(`Đã mở SOP: ${res.data.sop.title}`);
      return;
    }
    showFocusRuntimeFeedback('Không tìm thấy SOP phù hợp');
  }, [ctx.currentTask?.status, ctx.currentFocusItem?.status]);

  const onQuickFormTemplate = useCallback(async () => {
    const { workInboxOperationalApi } = await import('../operationalRuntime/workInboxOperationalApi');
    const related = ctx.currentTask?.relatedEntityType ?? 'GENERAL';
    const res = await workInboxOperationalApi.listFormTemplates(String(related));
    const templates = res.ok ? res.data?.templates ?? [] : [];
    if (templates.length === 0) {
      showFocusRuntimeFeedback('Chưa có mẫu biểu mẫu');
      return;
    }
    const first = templates[0];
    if (first.url && first.url !== '#') {
      window.open(first.url, '_blank', 'noopener,noreferrer');
    }
    showFocusRuntimeFeedback(
      templates.length > 1 ? `Đã mở: ${first.title} (+${templates.length - 1} mẫu khác)` : `Đã mở: ${first.title}`,
    );
  }, [ctx.currentTask?.relatedEntityType]);

  const isFocusActionPending = useCallback(
    (taskId: string, action: FocusPendingAction) =>
      pending?.taskId === taskId && pending.action === action,
    [pending],
  );

  const primaryLabel = focusPrimaryLabel(ctx.currentTask ?? undefined);

  return {
    onFocusPrimary,
    onFocusPause: onFocusPauseRequest,
    onFocusForward: onFocusForwardRequest,
    onFocusComplete,
    onNavigatePrev,
    onNavigateNext,
    onMoreAction,
    onQuickCall,
    onQuickMessage,
    onQuickAppointment,
    onQuickGuide,
    onQuickFormTemplate,
    isFocusActionPending,
    pauseDialogOpen,
    setPauseDialogOpen,
    handoffDialogOpen,
    setHandoffDialogOpen,
    moreMenuOpen,
    setMoreMenuOpen,
    onFocusPauseConfirm,
    onFocusHandoffConfirm,
    appointmentDialogOpen,
    setAppointmentDialogOpen,
    onAppointmentConfirm,
    onSaveNote,
    primaryLabel,
    operatorOptions: buildAssigneeOptions(ctx),
    opPermissions: ctx.permissions.ops,
  };
}

function buildAssigneeOptions(ctx: ReturnType<typeof useWorkInboxRuntimeContext>): string[] {
  const ids = new Set<string>();
  for (const t of ctx.tasks) {
    if (t.ownerId) ids.add(t.ownerId);
    if (t.owner) ids.add(t.owner);
  }
  const me = resolveRuntimeUser(ctx.operator.userId);
  if (me?.userCode) ids.add(me.userCode);
  if (me?.id) ids.add(me.id);
  return Array.from(ids).filter(Boolean).slice(0, 20);
}
