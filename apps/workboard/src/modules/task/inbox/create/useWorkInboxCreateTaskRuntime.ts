import { useCallback, useMemo, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { getActiveWorkInboxTraceId } from '@/modules/task/inbox/performance/workInboxPerformanceTrace';
import { useWorkInboxRuntimeContextOptional } from '@/runtime/rcla/workInboxRuntimeContextRegistry';
import {
  buildTaskCreationAutofillPreview,
  buildTaskCreationPayload,
  initializeCreateTaskForm,
  validateTaskCreationInput,
} from './buildTaskCreationPayload';
import { resolveTaskCreationCatalog } from './resolveTaskCreationCatalog';
import type { WorkInboxCreateTaskForm, WorkInboxCreateTaskResult } from './workInboxCreateTaskTypes';

export interface UseWorkInboxCreateTaskRuntimeOptions {
  operator: UserContext;
  onCreated?: (result: WorkInboxCreateTaskResult) => void;
}

export function useWorkInboxCreateTaskRuntime(options: UseWorkInboxCreateTaskRuntimeOptions) {
  const ctx = useWorkInboxRuntimeContextOptional();
  const operator = ctx?.operator ?? options.operator;
  const catalog = useMemo(() => resolveTaskCreationCatalog(operator), [operator]);

  const [form, setForm] = useState<WorkInboxCreateTaskForm>(() => initializeCreateTaskForm(operator));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autofillPreview = useMemo(
    () => buildTaskCreationAutofillPreview(operator),
    [operator],
  );

  const resetForm = useCallback(() => {
    setForm(initializeCreateTaskForm(operator));
    setError(null);
  }, [operator]);

  const submit = useCallback(async (): Promise<WorkInboxCreateTaskResult> => {
    const validationError = validateTaskCreationInput(form, catalog);
    if (validationError) {
      setError(validationError);
      return { ok: false, error: validationError };
    }

    setLoading(true);
    setError(null);

    const traceId = getActiveWorkInboxTraceId();
    const { request } = buildTaskCreationPayload({ form, operator, catalog, traceId: traceId ?? undefined });

    const res = await api.createWorkInboxUserTask({
      ...request,
      assignee: request.ownerId,
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
  }, [catalog, form, operator, options, resetForm]);

  return {
    form,
    setForm,
    loading,
    error,
    submit,
    resetForm,
    operator,
    catalog,
    autofillPreview,
    runtimeContextUsed: Boolean(ctx),
  };
}
