import type { ApiEnvelope, TaskFilter } from './contracts';
import { mockApi } from './mockApi';
import { getAuthToken, clearStoredAuthSession } from '@/auth/sessionStorage';
import { getActiveWorkInboxTraceId } from '@/modules/task/inbox/performance/workInboxPerformanceTrace';
import { getApiBaseUrl, isWorkerApiConfigured } from './apiBase';

const API_BASE = getApiBaseUrl();
const API_ROLE = import.meta.env.VITE_CBV_ROLE?.trim() ?? '';
const TASK_RUNTIME_MODE = import.meta.env.VITE_CBV_TASK_RUNTIME_MODE?.trim() ?? 'google_sheet_existing_db';

function isWorkerConnected(): boolean {
  return isWorkerApiConfigured();
}

function isRealTaskRuntime(): boolean {
  return isWorkerConnected() && TASK_RUNTIME_MODE === 'google_sheet_existing_db';
}

/** Task workspace: no mock when worker + real runtime mode (GS_02) */
function useTaskMock(): boolean {
  if (isRealTaskRuntime()) return false;
  return !isWorkerConnected();
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (API_ROLE) headers['x-cbv-role'] = API_ROLE;
  const traceId = getActiveWorkInboxTraceId();
  if (traceId) headers['X-CBV-Trace-Id'] = traceId;
  return headers;
}

function encodeTaskId(taskId: string): string {
  return encodeURIComponent(taskId.trim());
}

async function fetchEnvelope<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const started = Date.now();
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...buildHeaders(), ...(init?.headers as Record<string, string>) },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
      if (body && typeof body.ok === 'boolean') return body;
      return {
        ok: false,
        status: 'FAIL',
        data: null as T,
        warnings: [],
        errors: [`Không kết nối được API (${res.status})`],
        traceId: `http-${Date.now()}`,
      };
    }
    const json = (await res.json()) as ApiEnvelope<T>;
    if (json.data && typeof json.data === 'object' && json.data !== null && 'runtime' in json.data) {
      const rt = (json.data as { runtime: Record<string, unknown> }).runtime;
      rt.workerLatencyMs = rt.workerLatencyMs ?? Date.now() - started;
    }
    return json;
  } catch {
    return {
      ok: false,
      status: 'FAIL',
      data: null as T,
      warnings: isRealTaskRuntime() ? ['GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED'] : [],
      errors: isRealTaskRuntime()
        ? ['Runtime TASK_MAIN chưa kết nối — kiểm tra Worker và GAS']
        : ['Không kết nối được Worker API'],
      traceId: `net-${Date.now()}`,
    };
  }
}

async function withFallback<T>(
  workerCall: () => Promise<ApiEnvelope<T>>,
  mockCall: () => Promise<ApiEnvelope<T>>,
): Promise<ApiEnvelope<T>> {
  if (!isWorkerConnected()) return mockCall();
  return workerCall();
}

export const api = {
  isMockMode: () => !isWorkerConnected(),
  isRealTaskRuntime,
  taskRuntimeMode: TASK_RUNTIME_MODE,
  apiBaseUrl: API_BASE,

  getCurrentUser() {
    if (isWorkerConnected() && getAuthToken()) {
      return fetchEnvelope<import('./contracts').UserContext>('/api/auth/me');
    }
    return withFallback(
      () => fetchEnvelope<import('./contracts').UserContext>('/api/me'),
      () => mockApi.getCurrentUser(),
    );
  },

  login(identifier: string, password: string) {
    return fetchEnvelope<{
      token: string;
      user: import('./contracts').UserContext;
      mustChangePassword: boolean;
    }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
  },

  logout() {
    clearStoredAuthSession();
    if (!isWorkerConnected()) {
      return Promise.resolve({
        ok: true,
        status: 'GO' as const,
        data: { loggedOut: true },
        warnings: [],
        errors: [],
        traceId: `local-${Date.now()}`,
      });
    }
    return fetchEnvelope<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  getUsers() {
    return fetchEnvelope<import('./contracts').DirectoryUser[]>('/api/users');
  },

  getTodaySummary() {
    if (isRealTaskRuntime()) {
      return fetchEnvelope<import('./contracts').TodaySummary>('/api/today');
    }
    return withFallback(
      () => fetchEnvelope<import('./contracts').TodaySummary>('/api/today'),
      () => mockApi.getTodaySummary(),
    );
  },

  claimHomeAlert(alertId: string, note?: string) {
    return fetchEnvelope<{ alert: import('./contracts').AlertItem; alertId: string }>(
      `/api/home-alert/${encodeURIComponent(alertId)}/claim`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note ?? '' }),
      },
    );
  },

  resolveHomeAlert(alertId: string, note?: string) {
    return fetchEnvelope<{ alert: import('./contracts').AlertItem; alertId: string }>(
      `/api/home-alert/${encodeURIComponent(alertId)}/resolve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note ?? '' }),
      },
    );
  },

  getTasks(filter?: TaskFilter) {
    if (useTaskMock()) return mockApi.getTasks(filter);
    const qs = filter ? `?filter=${filter}` : '';
    return fetchEnvelope<import('./contracts').TaskItem[]>(`/api/tasks${qs}`);
  },

  getTaskWorkspaceSnapshot(params?: { status?: string; assignee?: string; priority?: string; q?: string; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.assignee) qs.set('assignee', params.assignee);
    if (params?.priority) qs.set('priority', params.priority);
    if (params?.q) qs.set('q', params.q);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();

    if (useTaskMock()) {
      return mockApi.getTasks().then((res) => {
        if (!res.ok) return res as unknown as ApiEnvelope<import('./contracts').TaskWorkspaceSnapshot>;
        const tasks = res.data;
        const today = new Date().toISOString().slice(0, 10);
        return {
          ok: true,
          status: 'GO_WITH_WARNINGS' as const,
          data: {
            tasks,
            counts: {
              total: tasks.length,
              open: tasks.filter((t) => t.status !== 'DONE').length,
              inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
              blocked: tasks.filter((t) => ['WAITING', 'BLOCKED'].includes(t.status)).length,
              done: tasks.filter((t) => t.status === 'DONE').length,
              dueToday: tasks.filter((t) => t.dueDate === today && t.status !== 'DONE').length,
              overdue: tasks.filter((t) => t.isOverdue).length,
            },
            blockedTasks: tasks.filter((t) => ['WAITING', 'BLOCKED'].includes(t.status)).slice(0, 10),
            dueTasks: tasks.filter((t) => t.dueDate === today && t.status !== 'DONE').slice(0, 10),
            overdueTasks: tasks.filter((t) => t.isOverdue).slice(0, 10),
            runtime: {
              mode: 'mock_dev_only',
              dbSheet: 'TASK_MAIN',
              sheetId: '',
              lastSyncAt: new Date().toISOString(),
              cacheHit: false,
              connected: false,
            },
          },
          warnings: ['Dev mock — set VITE_CBV_API_BASE_URL để dùng runtime thật'],
          errors: [],
          traceId: `mock-${Date.now()}`,
        };
      });
    }

    return fetchEnvelope<import('./contracts').TaskWorkspaceSnapshot>(
      `/api/tasks/workspace-snapshot${query ? `?${query}` : ''}`,
    );
  },

  getTaskDetail(taskId: string) {
    if (useTaskMock()) return mockApi.getTaskDetail(taskId);
    return fetchEnvelope<import('./contracts').TaskDetail | null>(`/api/tasks/${encodeTaskId(taskId)}`);
  },

  getTaskWriteCapability() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').TaskWriteCapability>('/api/tasks/write-capability'),
      () => mockApi.getTaskWriteCapability(),
    );
  },

  createTask(body: import('./contracts').CreateTaskBody) {
    if (useTaskMock()) return mockApi.createTask(body);
    return fetchEnvelope<import('./contracts').TaskWriteResult>('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  createWorkInboxUserTask(body: import('@/modules/task/inbox/create/workInboxCreateTaskTypes').WorkInboxCreateTaskRequest) {
    if (useTaskMock()) return mockApi.createWorkInboxUserTask(body);
    return fetchEnvelope<{
      task: import('./contracts').TaskDetail;
      taskPatch?: import('./contracts').TaskDetail;
      timelineEvent?: { eventType: string; eventLabel?: string } | null;
      auditEvent?: { action: string } | null;
      refreshPolicy?: 'SELECTIVE' | 'SNAPSHOT' | 'BUNDLE_ONLY' | 'NONE';
    }>('/api/work-inbox/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  listWorkInboxChecklist(taskId: string) {
    if (useTaskMock()) return mockApi.listWorkInboxChecklist(taskId);
    return fetchEnvelope<import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistListResult & {
      items: import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistItem[];
      taskId: string;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist`);
  },

  createWorkInboxChecklistItem(
    taskId: string,
    body: { title: string; sortOrder?: number; traceId?: string },
  ) {
    if (useTaskMock()) return mockApi.createWorkInboxChecklistItem(taskId, body);
    return fetchEnvelope<import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistMutateResult & {
      item: import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistItem;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  updateWorkInboxChecklistItem(
    taskId: string,
    checklistId: string,
    body: { title?: string; sortOrder?: number; traceId?: string },
  ) {
    if (useTaskMock()) return mockApi.updateWorkInboxChecklistItem(taskId, checklistId, body);
    return fetchEnvelope<import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistMutateResult & {
      item: import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistItem;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist/${encodeURIComponent(checklistId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  toggleWorkInboxChecklistItem(
    taskId: string,
    checklistId: string,
    body?: { isDone?: boolean; traceId?: string },
  ) {
    if (useTaskMock()) return mockApi.toggleWorkInboxChecklistItem(taskId, checklistId, body);
    return fetchEnvelope<import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistMutateResult & {
      item: import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistItem;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist/${encodeURIComponent(checklistId)}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  },

  deleteWorkInboxChecklistItem(taskId: string, checklistId: string, traceId?: string) {
    if (useTaskMock()) return mockApi.deleteWorkInboxChecklistItem(taskId, checklistId);
    return fetchEnvelope<import('@/modules/task/inbox/checklist/workInboxChecklistTypes').WorkInboxChecklistMutateResult>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist/${encodeURIComponent(checklistId)}`, {
      method: 'DELETE',
      headers: traceId ? { 'X-CBV-Trace-Id': traceId } : undefined,
    });
  },

  callWorkInboxChecklistBridge(
    taskId: string,
    body: { method: string; [key: string]: unknown },
  ) {
    if (useTaskMock()) {
      return Promise.resolve({
        ok: false,
        status: 'FAIL' as const,
        errors: ['Checklist bridge unavailable in mock mode'],
        traceId: '',
        data: null,
        warnings: [],
      });
    }
    return fetchEnvelope<unknown>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/checklist-bridge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  listWorkInboxAttachments(taskId: string) {
    if (useTaskMock()) return mockApi.listWorkInboxAttachments(taskId);
    return fetchEnvelope<{
      taskId: string;
      items: import('@/modules/task/inbox/attachments/workInboxAttachmentsTypes').WorkInboxAttachmentItem[];
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/attachments`);
  },

  createWorkInboxAttachment(
    taskId: string,
    body: {
      type: 'LINK' | 'TEXT';
      title?: string;
      url?: string;
      textContent?: string;
      note?: string;
      traceId?: string;
    },
  ) {
    if (useTaskMock()) return mockApi.createWorkInboxAttachment(taskId, body);
    return fetchEnvelope<{
      item: import('@/modules/task/inbox/attachments/workInboxAttachmentsTypes').WorkInboxAttachmentItem;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  updateWorkInboxAttachment(
    taskId: string,
    attachmentId: string,
    body: { type?: 'LINK' | 'TEXT'; title?: string; url?: string; textContent?: string; note?: string; traceId?: string },
  ) {
    if (useTaskMock()) return mockApi.updateWorkInboxAttachment(taskId, attachmentId, body);
    return fetchEnvelope<{
      item: import('@/modules/task/inbox/attachments/workInboxAttachmentsTypes').WorkInboxAttachmentItem;
    }>(`/api/work-inbox/tasks/${encodeTaskId(taskId)}/attachments/${encodeURIComponent(attachmentId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  deleteWorkInboxAttachment(taskId: string, attachmentId: string, traceId?: string) {
    if (useTaskMock()) return mockApi.deleteWorkInboxAttachment(taskId, attachmentId);
    return fetchEnvelope<{ deleted: boolean; attachmentId: string }>(
      `/api/work-inbox/tasks/${encodeTaskId(taskId)}/attachments/${encodeURIComponent(attachmentId)}`,
      {
        method: 'DELETE',
        headers: traceId ? { 'X-CBV-Trace-Id': traceId } : undefined,
      },
    );
  },

  updateTask(taskId: string, body: import('./contracts').UpdateTaskBody) {
    if (useTaskMock()) return mockApi.updateTask(taskId, body);
    return fetchEnvelope<import('./contracts').TaskWriteResult>(`/api/tasks/${encodeTaskId(taskId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  updateTaskStatus(taskId: string, status: string, note?: string) {
    if (useTaskMock()) return mockApi.updateTask(taskId, { status, note });
    return fetchEnvelope<import('./contracts').TaskDbActionResult>(`/api/tasks/${encodeTaskId(taskId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
  },

  assignTask(taskId: string, assignee: string, note?: string) {
    if (useTaskMock()) return mockApi.updateTask(taskId, { assignee, note });
    return fetchEnvelope<import('./contracts').TaskDbActionResult>(`/api/tasks/${encodeTaskId(taskId)}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee, note }),
    });
  },

  addTaskComment(taskId: string, comment: string) {
    if (useTaskMock()) return mockApi.updateTask(taskId, { note: comment });
    return fetchEnvelope<import('./contracts').TaskDbActionResult>(`/api/tasks/${encodeTaskId(taskId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
  },

  completeTask(taskId: string, note?: string) {
    if (useTaskMock()) return mockApi.updateTask(taskId, { status: 'DONE', note });
    return fetchEnvelope<import('./contracts').TaskDbActionResult>(`/api/tasks/${encodeTaskId(taskId)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
  },

  getFinanceItems() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').FinanceItem[]>('/api/finance'),
      () => mockApi.getFinanceItems(),
    );
  },

  getHoSoItems() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').HoSoItem[]>('/api/hoso'),
      () => mockApi.getHoSoItems(),
    );
  },

  getCoordination() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').CoordinationData>('/api/coordination'),
      () => mockApi.getCoordination(),
    );
  },

  getObservation() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').ObservationData>('/api/observation'),
      () => mockApi.getObservation(),
    );
  },

  getPlugins() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').PluginsResponse>('/api/plugins'),
      () => mockApi.getPlugins(),
    );
  },

  getModules() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').ModulesResponse>('/api/modules'),
      () => mockApi.getModules(),
    );
  },

  getModule(moduleId: string) {
    return withFallback(
      () => fetchEnvelope<import('./contracts').ModuleRegistryEntry>(`/api/modules/${encodeURIComponent(moduleId)}`),
      () => mockApi.getModule(moduleId),
    );
  },

  getModulesStatus() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').ModuleStatusResponse>('/api/modules/status'),
      () => mockApi.getModulesStatus(),
    );
  },

  search(query: string) {
    return withFallback(
      () => fetchEnvelope<import('./contracts').SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`),
      () => mockApi.search(query),
    );
  },
};

export type ApiClient = typeof api;
