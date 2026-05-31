/**
 * PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1
 */

export type WorkInboxAttachmentType = 'LINK' | 'TEXT' | 'FILE' | 'IMAGE';

export interface WorkInboxAttachmentItem {
  attachmentId: string;
  taskId: string;
  type: WorkInboxAttachmentType;
  title: string;
  url?: string;
  textContent?: string;
  fileName?: string;
  fileId?: string;
  note?: string;
  source?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

export interface WorkInboxAttachmentListResponse {
  taskId: string;
  items: WorkInboxAttachmentItem[];
  refreshPolicy?: 'ATTACHMENTS_ONLY' | 'SELECTIVE' | 'NONE';
}

export interface WorkInboxAttachmentMutateResponse {
  item?: WorkInboxAttachmentItem;
  attachmentId?: string;
  deleted?: boolean;
  timelineEvent?: { eventType?: string; eventLabel?: string } | null;
  auditEvent?: { action?: string; auditId?: string } | null;
  refreshPolicy?: 'ATTACHMENTS_ONLY' | 'SELECTIVE' | 'NONE';
}

export interface WorkInboxAttachmentCreateBody {
  type: 'LINK' | 'TEXT';
  title?: string;
  url?: string;
  textContent?: string;
  note?: string;
  traceId?: string;
}

export interface WorkInboxAttachmentUpdateBody {
  type?: 'LINK' | 'TEXT';
  title?: string;
  url?: string;
  textContent?: string;
  note?: string;
  traceId?: string;
}
