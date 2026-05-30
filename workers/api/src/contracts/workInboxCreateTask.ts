import type { TaskDetail } from '../contracts';

export type WorkInboxCreateTaskPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface WorkInboxCreateTaskRequest {
  traceId?: string;
  actor?: string;
  actorRole?: string;
  title: string;
  description?: string;
  priority?: WorkInboxCreateTaskPriority;
  dueDate?: string;
  relatedPhone?: string;
  relatedPlate?: string;
  assignee?: string;
}

export interface WorkInboxCreateTaskTimelineEvent {
  timelineId?: string;
  eventType: string;
  eventLabel?: string;
  actor?: string;
}

export interface WorkInboxCreateTaskAuditEvent {
  auditId?: string;
  action: string;
  actor?: string;
}

export type WorkInboxCreateRefreshPolicy = 'SELECTIVE' | 'SNAPSHOT' | 'BUNDLE_ONLY' | 'NONE';

export interface WorkInboxCreateTaskResponse {
  task: TaskDetail;
  taskPatch?: TaskDetail;
  timelineEvent?: WorkInboxCreateTaskTimelineEvent | null;
  auditEvent?: WorkInboxCreateTaskAuditEvent | null;
  refreshPolicy?: WorkInboxCreateRefreshPolicy;
}
