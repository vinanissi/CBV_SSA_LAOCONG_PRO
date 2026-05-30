import type { TaskDetail } from '../contracts';

export type WorkInboxCombinedActionType =
  | 'START_PROCESSING'
  | 'PAUSE_TASK'
  | 'HANDOFF_TASK'
  | 'COMPLETE_TASK'
  | 'SAVE_NOTE'
  | 'CREATE_APPOINTMENT';

export type WorkInboxRefreshPolicy = 'SELECTIVE' | 'SNAPSHOT' | 'BUNDLE_ONLY' | 'NONE';

export interface WorkInboxCombinedActionRequest {
  traceId: string;
  action: WorkInboxCombinedActionType;
  taskId: string;
  actor: string;
  actorRole: string;
  beforeState?: string;
  note?: string;
  payload?: Record<string, unknown>;
}

export interface WorkInboxCombinedActionResponse {
  ok: boolean;
  traceId: string;
  taskId: string;
  action: WorkInboxCombinedActionType | string;
  taskPatch?: TaskDetail | Record<string, unknown> | null;
  timelineEvent?: Record<string, unknown>;
  auditEvent?: Record<string, unknown>;
  operationalPatch?: Record<string, unknown> | null;
  refreshPolicy?: WorkInboxRefreshPolicy;
  combinedActionUsed?: boolean;
  performanceTrace?: Record<string, unknown>;
  error?: string;
}
