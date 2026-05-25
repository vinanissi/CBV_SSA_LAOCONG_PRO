import type { ApiEnvelope, TaskFilter } from './contracts';
import { mockApi } from './mockApi';

const API_BASE = import.meta.env.VITE_CBV_API_BASE_URL?.trim() ?? '';

function useMock(): boolean {
  return !API_BASE;
}

async function fetchEnvelope<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
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
}

export const api = {
  isMockMode: useMock,

  getCurrentUser() {
    if (useMock()) return mockApi.getCurrentUser();
    return fetchEnvelope<import('./contracts').UserContext>('/api/user/me');
  },

  getTodaySummary() {
    if (useMock()) return mockApi.getTodaySummary();
    return fetchEnvelope<import('./contracts').TodaySummary>('/api/workboard/today');
  },

  getTasks(filter?: TaskFilter) {
    if (useMock()) return mockApi.getTasks(filter);
    const qs = filter ? `?filter=${filter}` : '';
    return fetchEnvelope<import('./contracts').TaskItem[]>(`/api/tasks${qs}`);
  },

  getTaskDetail(taskId: string) {
    if (useMock()) return mockApi.getTaskDetail(taskId);
    return fetchEnvelope<import('./contracts').TaskDetail | null>(`/api/tasks/${taskId}`);
  },

  getFinanceItems() {
    if (useMock()) return mockApi.getFinanceItems();
    return fetchEnvelope<import('./contracts').FinanceItem[]>('/api/finance');
  },

  getHoSoItems() {
    if (useMock()) return mockApi.getHoSoItems();
    return fetchEnvelope<import('./contracts').HoSoItem[]>('/api/hoso');
  },

  getCoordination() {
    if (useMock()) return mockApi.getCoordination();
    return fetchEnvelope<import('./contracts').CoordinationData>('/api/coordination');
  },

  getObservation() {
    if (useMock()) return mockApi.getObservation();
    return fetchEnvelope<import('./contracts').ObservationData>('/api/observation');
  },

  getPlugins() {
    if (useMock()) return mockApi.getPlugins();
    return fetchEnvelope<import('./contracts').PluginsResponse>('/api/plugins');
  },

  search(query: string) {
    if (useMock()) return mockApi.search(query);
    return fetchEnvelope<import('./contracts').SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
  },
};

export type ApiClient = typeof api;
