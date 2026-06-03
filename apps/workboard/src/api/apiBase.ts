/**
 * Worker API base URL resolution (PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX).
 * - Absolute URL: cross-origin fetch to Worker (requires CORS).
 * - Empty base in dev: same-origin `/api/*` via Vite proxy → 127.0.0.1:8787.
 */
const ENV_BASE = import.meta.env.VITE_CBV_API_BASE_URL?.trim() ?? '';
const DEV_PROXY_FLAG = import.meta.env.VITE_CBV_DEV_PROXY?.trim() ?? '';
const TASK_RUNTIME_MODE = import.meta.env.VITE_CBV_TASK_RUNTIME_MODE?.trim() ?? '';

/** Resolved fetch prefix (no trailing slash). Empty string = same-origin /api proxy. */
export function getApiBaseUrl(): string {
  if (ENV_BASE) return ENV_BASE.replace(/\/+$/, '');
  if (import.meta.env.DEV && DEV_PROXY_FLAG !== 'false') return '';
  return '';
}

/** True when the app should call Worker routes (not offline mock). */
export function isWorkerApiConfigured(): boolean {
  if (getApiBaseUrl()) return true;
  return import.meta.env.DEV && DEV_PROXY_FLAG !== 'false' && Boolean(TASK_RUNTIME_MODE);
}
