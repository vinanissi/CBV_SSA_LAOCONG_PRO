/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CBV_API_BASE_URL?: string;
  readonly VITE_CBV_ROLE?: string;
  /** Phase C — set false to hide Work Inbox V3 group panel on /inbox */
  readonly VITE_CBV_WORK_INBOX_GROUPS_V3?: string;
  /** Phase E — set false to hide Focus Mode V3 button inside groups panel */
  readonly VITE_CBV_WORK_INBOX_FOCUS_V3?: string;
  /** Runtime transition — V3 primary on /inbox (default on) */
  readonly VITE_CBV_WORK_INBOX_V3_PRIMARY?: string;
  /** Runtime transition — legacy task runtime panel (default on) */
  readonly VITE_CBV_LEGACY_TASK_RUNTIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
