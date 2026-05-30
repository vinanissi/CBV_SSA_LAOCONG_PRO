import type { ApiEnvelope } from '@/api/contracts';
import type {
  FormTemplateEntry,
  SopEntry,
  TaskOperationalBundle,
} from './workInboxOperationalTypes';

import { getActiveWorkInboxTraceId } from '../performance/workInboxPerformanceTrace';

const API_BASE = import.meta.env.VITE_CBV_API_BASE_URL?.trim() ?? '';

function perfHeaders(): Record<string, string> {
  const traceId = getActiveWorkInboxTraceId();
  return traceId ? { 'X-CBV-Trace-Id': traceId } : {};
}

async function fetchOp<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  if (!API_BASE) {
    return {
      ok: false,
      status: 'FAIL',
      data: null as T,
      warnings: ['OPERATIONAL_API_OFFLINE'],
      errors: ['Chưa cấu hình VITE_CBV_API_BASE_URL'],
      traceId: `local-${Date.now()}`,
    };
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...perfHeaders(), ...(init?.headers as Record<string, string>) },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
      if (body && typeof body.ok === 'boolean') return body;
      return {
        ok: false,
        status: 'FAIL',
        data: null as T,
        warnings: [],
        errors: [`API ${res.status}: ${res.statusText || 'Bad Request'}`],
        traceId: `http-${Date.now()}`,
      };
    }
    return (await res.json()) as ApiEnvelope<T>;
  } catch (err) {
    if (init?.signal?.aborted) {
      return {
        ok: false,
        status: 'FAIL',
        data: null as T,
        warnings: [],
        errors: ['Aborted'],
        traceId: `abort-${Date.now()}`,
      };
    }
    return {
      ok: false,
      status: 'FAIL',
      data: null as T,
      warnings: [],
      errors: ['Không kết nối được Worker API'],
      traceId: `net-${Date.now()}`,
    };
  }
}

export const workInboxOperationalApi = {
  getTaskOperational(taskId: string, signal?: AbortSignal) {
    return fetchOp<TaskOperationalBundle>(
      `/api/work-inbox/tasks/${encodeURIComponent(taskId)}/operational`,
      { signal },
    );
  },

  createAppointment(taskId: string, body: { title: string; description?: string; startAt?: string; endAt?: string }) {
    return fetchOp<unknown>(`/api/work-inbox/tasks/${encodeURIComponent(taskId)}/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  saveNote(taskId: string, content: string) {
    return fetchOp<unknown>(`/api/work-inbox/tasks/${encodeURIComponent(taskId)}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  },

  addDocument(taskId: string, body: { title: string; url?: string }) {
    return fetchOp<unknown>(`/api/work-inbox/tasks/${encodeURIComponent(taskId)}/document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  lookupSop(params: { module?: string; taskType?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params.module) q.set('module', params.module);
    if (params.taskType) q.set('taskType', params.taskType);
    if (params.status) q.set('status', params.status);
    return fetchOp<{ sop: SopEntry | null }>(`/api/work-inbox/sop?${q.toString()}`);
  },

  listFormTemplates(category?: string) {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetchOp<{ templates: FormTemplateEntry[] }>(`/api/work-inbox/form-templates${q}`);
  },
};
