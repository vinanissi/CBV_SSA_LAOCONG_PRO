/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CBV_API_BASE_URL?: string;
  /** Set false to skip same-origin Vite /api proxy in dev */
  readonly VITE_CBV_DEV_PROXY?: string;
  readonly VITE_CBV_ROLE?: string;
  /** Phase C — set false to hide Work Inbox V3 group panel on /inbox */
  readonly VITE_CBV_WORK_INBOX_GROUPS_V3?: string;
  /** Phase E — set false to hide Focus Mode V3 button inside groups panel */
  readonly VITE_CBV_WORK_INBOX_FOCUS_V3?: string;
  /** Runtime transition — V3 primary on /inbox (default on) */
  readonly VITE_CBV_WORK_INBOX_V3_PRIMARY?: string;
  /** Runtime transition — legacy task runtime panel (default on) */
  readonly VITE_CBV_LEGACY_TASK_RUNTIME?: string;
  /** OCMS Case Context Strip in Focus Mode (default OFF) */
  readonly VITE_OCMS_CASE_STRIP_ENABLED?: string;
  /** OCMS UAT session telemetry — sessionStorage only */
  readonly VITE_OCMS_UAT_TELEMETRY?: string;
  /** Case Workspace in Focus Mode (CASE_REFACTOR_03) — default OFF */
  readonly VITE_CASE_WORKSPACE_ENABLED?: string;
  /** Case Workspace UAT session counters — sessionStorage only */
  readonly VITE_CASE_WORKSPACE_UAT_TELEMETRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
