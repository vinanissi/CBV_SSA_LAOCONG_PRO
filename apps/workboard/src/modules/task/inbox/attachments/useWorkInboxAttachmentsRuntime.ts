import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { getActiveWorkInboxTraceId } from '@/modules/task/inbox/performance/workInboxPerformanceTrace';
import { removeAttachmentItem, upsertAttachmentItem } from './workInboxAttachmentsLocalState';
import type { WorkInboxAttachmentForm, WorkInboxAttachmentItem } from './workInboxAttachmentsTypes';

export interface UseWorkInboxAttachmentsRuntimeOptions {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
}

export function useWorkInboxAttachmentsRuntime(options: UseWorkInboxAttachmentsRuntimeOptions) {
  const [items, setItems] = useState<WorkInboxAttachmentItem[]>([]);
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
    const res = await api.listWorkInboxAttachments(taskId);
    if (gen !== loadGenRef.current) return;
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.errors[0] ?? 'Không tải tài liệu');
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

  const createAttachment = useCallback(
    async (form: WorkInboxAttachmentForm) => {
      if (!options.canMutate) return { ok: false as const, error: 'Không có quyền' };
      setMutatingId('__create__');
      setError(null);
      const res = await api.createWorkInboxAttachment(options.taskId, {
        type: form.type,
        title: form.title.trim() || undefined,
        url: form.type === 'LINK' ? form.url.trim() : undefined,
        textContent: form.type === 'TEXT' ? form.textContent.trim() : undefined,
        note: form.note.trim() || undefined,
        traceId: traceId(),
      });
      setMutatingId(null);
      if (!res.ok || !res.data?.item) {
        const msg = res.errors[0] ?? 'Không thêm tài liệu';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => upsertAttachmentItem(prev, res.data!.item!));
      return { ok: true as const, item: res.data.item };
    },
    [options.canMutate, options.taskId],
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string) => {
      if (!options.canMutate) return { ok: false as const };
      setMutatingId(attachmentId);
      setError(null);
      const res = await api.deleteWorkInboxAttachment(options.taskId, attachmentId, traceId());
      setMutatingId(null);
      if (!res.ok) {
        const msg = res.errors[0] ?? 'Không xóa tài liệu';
        setError(msg);
        return { ok: false as const, error: msg };
      }
      setItems((prev) => removeAttachmentItem(prev, attachmentId));
      return { ok: true as const };
    },
    [options.canMutate, options.taskId],
  );

  const pasteFromClipboard = useCallback(async (): Promise<Partial<WorkInboxAttachmentForm> | null> => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) return null;
      if (/^https?:\/\//i.test(trimmed)) {
        return { type: 'LINK', url: trimmed, title: trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed };
      }
      return { type: 'TEXT', textContent: trimmed, title: trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : '') };
    } catch {
      return null;
    }
  }, []);

  return {
    items,
    loading,
    error,
    mutatingId,
    canMutate: options.canMutate !== false,
    reload: load,
    createAttachment,
    deleteAttachment,
    pasteFromClipboard,
  };
}
