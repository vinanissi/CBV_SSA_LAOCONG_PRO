import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { getActiveWorkInboxTraceId } from '@/modules/task/inbox/performance/workInboxPerformanceTrace';
import { useWorkInboxRuntimeContextOptional } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import {
  removeChecklistItem,
  upsertChecklistItem,
} from './workInboxChecklistLocalState';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

export interface UseWorkInboxChecklistRuntimeOptions {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
}

export function useWorkInboxChecklistRuntime(options: UseWorkInboxChecklistRuntimeOptions) {
  const ctx = useWorkInboxRuntimeContextOptional();
  const operator = ctx?.operator ?? options.operator;
  const canMutate = options.canMutate !== false;

  const [items, setItems] = useState<WorkInboxChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadGenRef = useRef(0);

  const load = useCallback(async () => {
    const taskId = options.taskId?.trim();
    if (!taskId) {
      setItems([]);
      return;
    }
    const gen = ++loadGenRef.current;
    setLoading(true);
    setError(null);
    const res = await api.listWorkInboxChecklist(taskId);
    if (gen !== loadGenRef.current) return;
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.errors[0] ?? 'Không tải checklist');
      return;
    }
    setItems(res.data.items ?? []);
  }, [options.taskId]);

  useEffect(() => {
    void load();
    return () => {
      loadGenRef.current += 1;
    };
  }, [load]);

  const traceId = () => getActiveWorkInboxTraceId() ?? undefined;

  const createItem = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed || !canMutate) return { ok: false as const, error: 'Không thể thêm mục' };
      setMutatingId('__create__');
      setError(null);
      const res = await api.createWorkInboxChecklistItem(options.taskId, {
        title: trimmed,
        traceId: traceId(),
      });
      setMutatingId(null);
      if (!res.ok || !res.data?.item) {
        const msg = res.errors[0] ?? 'Không tạo mục';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => upsertChecklistItem(prev, res.data!.item!));
      return { ok: true as const, item: res.data.item };
    },
    [canMutate, options.taskId],
  );

  const updateItem = useCallback(
    async (checklistId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed || !canMutate) return { ok: false as const, error: 'title không hợp lệ' };
      setMutatingId(checklistId);
      setError(null);
      const res = await api.updateWorkInboxChecklistItem(options.taskId, checklistId, {
        title: trimmed,
        traceId: traceId(),
      });
      setMutatingId(null);
      if (!res.ok || !res.data?.item) {
        const msg = res.errors[0] ?? 'Không cập nhật';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => upsertChecklistItem(prev, res.data!.item!));
      return { ok: true as const };
    },
    [canMutate, options.taskId],
  );

  const toggleItem = useCallback(
    async (checklistId: string, isDone?: boolean) => {
      if (!canMutate) return { ok: false as const };
      setMutatingId(checklistId);
      setError(null);
      const res = await api.toggleWorkInboxChecklistItem(options.taskId, checklistId, {
        isDone,
        traceId: traceId(),
      });
      setMutatingId(null);
      if (!res.ok || !res.data?.item) {
        const msg = res.errors[0] ?? 'Không đổi trạng thái';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => upsertChecklistItem(prev, res.data!.item!));
      return { ok: true as const };
    },
    [canMutate, options.taskId],
  );

  const deleteItem = useCallback(
    async (checklistId: string) => {
      if (!canMutate) return { ok: false as const };
      setMutatingId(checklistId);
      setError(null);
      const res = await api.deleteWorkInboxChecklistItem(options.taskId, checklistId, traceId());
      setMutatingId(null);
      if (!res.ok) {
        const msg = res.errors[0] ?? 'Không xóa mục';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => removeChecklistItem(prev, checklistId));
      return { ok: true as const };
    },
    [canMutate, options.taskId],
  );

  return {
    items,
    loading,
    error,
    mutatingId,
    canMutate,
    operator,
    reload: load,
    createItem,
    updateItem,
    toggleItem,
    deleteItem,
    runtimeContextUsed: Boolean(ctx),
  };
}
