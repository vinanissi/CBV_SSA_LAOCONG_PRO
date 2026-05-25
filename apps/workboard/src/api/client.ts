import type { ApiEnvelope, TaskFilter } from './contracts';
import { mockApi } from './mockApi';

const API_BASE = import.meta.env.VITE_CBV_API_BASE_URL?.trim() ?? '';
const API_ROLE = import.meta.env.VITE_CBV_ROLE?.trim() ?? '';

function useMock(): boolean {
  return !API_BASE;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (API_ROLE) headers['x-cbv-role'] = API_ROLE;
  return headers;
}

async function fetchEnvelope<T>(path: string): Promise<ApiEnvelope<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: buildHeaders() });
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
    return res.json();
  } catch {
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

async function withFallback<T>(
  workerCall: () => Promise<ApiEnvelope<T>>,
  mockCall: () => Promise<ApiEnvelope<T>>,
): Promise<ApiEnvelope<T>> {
  if (useMock()) return mockCall();
  const result = await workerCall();
  if (!result.ok && result.errors.some((e) => e.includes('Không kết nối'))) {
    return mockCall();
  }
  return result;
}

export const api = {
  isMockMode: useMock,
  apiBaseUrl: API_BASE,

  getCurrentUser() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').UserContext>('/api/me'),
      () => mockApi.getCurrentUser(),
    );
  },

  getTodaySummary() {
    return withFallback(
      () => fetchEnvelope<import('./contracts').TodaySummary>('/api/today'),
      () => mockApi.getTodaySummary(),
    );
  },

  getTasks(filter?: TaskFilter) {
    const qs = filter ? `?filter=${filter}` : '';
    return withFallback(
      () => fetchEnvelope<import('./contracts').TaskItem[]>(`/api/tasks${qs}`),
      () => mockApi.getTasks(filter),
    );
  },

  getTaskDetail(taskId: string) {
    return withFallback(
      () => fetchEnvelope<import('./contracts').TaskDetail | null>(`/api/tasks/${taskId}`),
      () => mockApi.getTaskDetail(taskId),
    );
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

  search(query: string) {
    return withFallback(
      () => fetchEnvelope<import('./contracts').SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`),
      () => mockApi.search(query),
    );
  },
};

export type ApiClient = typeof api;
