/** Work Inbox V3 — operational action codes (registry keys). */

export type WorkInboxActionCode =
  | 'ACTION_START_PROCESSING'
  | 'ACTION_PAUSE_TASK'
  | 'ACTION_HANDOFF'
  | 'ACTION_COMPLETE_TASK'
  | 'ACTION_CALL_CLICK'
  | 'ACTION_MESSAGE_CLICK'
  | 'ACTION_CREATE_APPOINTMENT'
  | 'ACTION_NAVIGATE_NEXT'
  | 'ACTION_NAVIGATE_PREVIOUS'
  | 'ACTION_MORE_COPY_LINK'
  | 'ACTION_MORE_PRIORITY'
  | 'ACTION_MORE_ATTACH'
  | 'ACTION_MORE_SUBTASK'
  | 'ACTION_MORE_EXPORT'
  | 'ACTION_GUIDE_OPEN'
  | 'ACTION_FORM_TEMPLATE_OPEN';

export type WorkInboxTimelineEvent =
  | 'TASK_STARTED'
  | 'TASK_PAUSED'
  | 'TASK_HANDOFF'
  | 'TASK_APPOINTMENT_CREATED'
  | 'TASK_COMPLETED'
  | 'TASK_CREATED_BY_USER';

export type WorkInboxAuditEvent =
  | 'ACTION_START_PROCESSING'
  | 'ACTION_PAUSE_TASK'
  | 'ACTION_HANDOFF'
  | 'ACTION_CALL_CLICK'
  | 'ACTION_MESSAGE_CLICK'
  | 'ACTION_CREATE_APPOINTMENT'
  | 'ACTION_NAVIGATE_NEXT'
  | 'ACTION_NAVIGATE_PREVIOUS'
  | 'ACTION_COMPLETE_TASK'
  | 'ACTION_NOTE_ADDED'
  | 'ACTION_DOCUMENT_ADDED'
  | 'ACTION_USER_CREATE_TASK';

export interface WorkInboxActionResult {
  ok: boolean;
  action: WorkInboxActionCode | string;
  taskId: string;
  actor: string;
  traceId: string;
  timestamp: string;
  timelineWritten: boolean;
  auditWritten: boolean;
  message?: string;
  error?: string;
  refreshPlan?: import('../performance/workInboxRefreshPolicy').WorkInboxActionRefreshPlan;
  combinedActionUsed?: boolean;
  fallbackEndpointUsed?: boolean;
}

export interface PauseReasonOption {
  id: string;
  label: string;
  statusNote: string;
}

export const PAUSE_REASON_OPTIONS: PauseReasonOption[] = [
  { id: 'customer', label: 'Chờ khách hàng', statusNote: 'Chờ khách hàng' },
  { id: 'hoso', label: 'Chờ hồ sơ', statusNote: 'Chờ hồ sơ' },
  { id: 'finance', label: 'Chờ kế toán', statusNote: 'Chờ kế toán' },
  { id: 'approval', label: 'Chờ duyệt', statusNote: 'Chờ duyệt' },
  { id: 'other', label: 'Khác', statusNote: 'Tạm dừng khác' },
];
