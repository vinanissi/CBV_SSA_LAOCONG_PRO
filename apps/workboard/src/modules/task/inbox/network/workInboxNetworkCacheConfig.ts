/** PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — TTL bounds for FE request caches. */

export const NETWORK_CACHE_TTL_MS = {
  /** Task detail: 15–30s */
  TASK_DETAIL: 25_000,
  /** Operational bundle: 10–20s */
  OPERATIONAL_BUNDLE: 15_000,
  /** Workspace snapshot: 10–30s unless manual refresh */
  WORKSPACE_SNAPSHOT: 20_000,
  /** /status, /modules, /write-capability: 60–120s */
  STATIC_RUNTIME: 90_000,
} as const;
