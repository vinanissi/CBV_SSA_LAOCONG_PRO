import { useCallback, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { getActiveWorkInboxTraceId } from '@/modules/task/inbox/performance/workInboxPerformanceTrace';
import { useWorkInboxRuntimeContextOptional } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import type { WorkInboxCreateTaskForm, WorkInboxCreateTaskResult } from './workInboxCreateTaskTypes';
import {
  DEFAULT_CREATE_FORM,
  normalizeCreatePhone,
  validateCreateTaskForm,
} from './workInboxCreateTaskTypes';

export interface UseWorkInboxCreateTaskRuntimeOptions {
  operator: UserContext;
  onCreated?: (result: WorkInboxCreateTaskResult) => void;
}

export function useWorkInboxCreateTaskRuntime(options: UseWorkInboxCreateTaskRuntimeOptions) {
  const ctx = useWorkInboxRuntimeContextOptional();
  const operator = ctx?.operator ?? options.operator;

  const [form, setForm] = useState<WorkInboxCreateTaskForm>(DEFAULT_CREATE_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_CREATE_FORM);
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<WorkInboxCreateTaskResult> => {
    const validationError = validateCreateTaskForm(form);
    if (validationError) {
      setError(validationError);
      return { ok: false, error: validationError };
    }

    setLoading(true);
    setError(null);

    const traceId = getActiveWorkInboxTraceId();
    const res = await api.createWorkInboxUserTask({
      traceId: traceId ?? undefined,
      actor: operator.displayName,
      actorRole: operator.role,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      relatedPhone: form.relatedPhone ? normalizeCreatePhone(form.relatedPhone) : undefined,
      relatedPlate: form.relatedPlate.trim() || undefined,
    });

    setLoading(false);

    if (!res.ok || !res.data?.task) {
      const msg = res.errors[0] ?? 'Không tạo được việc';
      setError(msg);
      return { ok: false, error: msg, traceId: res.traceId };
    }

    const result: WorkInboxCreateTaskResult = {
      ok: true,
      traceId: res.traceId,
      task: res.data.task,
      taskPatch: res.data.taskPatch ?? res.data.task,
      timelineEvent: res.data.timelineEvent ?? null,
      auditEvent: res.data.auditEvent ?? null,
      refreshPolicy: res.data.refreshPolicy ?? 'SELECTIVE',
    };

    options.onCreated?.(result);
    resetForm();
    return result;
  }, [form, operator.displayName, operator.role, options, resetForm]);

  return {
    form,
    setForm,
    loading,
    error,
    submit,
    resetForm,
    operator,
    runtimeContextUsed: Boolean(ctx),
  };
}
