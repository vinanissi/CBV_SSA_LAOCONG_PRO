/**
 * PHASE_CHECKLIST_13 — checklist file upload types.
 */

export type ChecklistUploadStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';

export interface ChecklistUploadInput {
  taskId: string;
  checklistItemId: string;
  file: File;
  fileName?: string;
  mimeType?: string | null;
  size?: number | null;
  actor?: string | null;
  traceId?: string | null;
}

export interface ChecklistUploadValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface ChecklistUploadResult {
  ok: boolean;
  status: ChecklistUploadStatus;
  traceId: string;
  taskId: string;
  checklistItemId: string;
  driveFolderId?: string | null;
  driveFileId?: string | null;
  driveUrl?: string | null;
  attachmentId?: string | null;
  fileName?: string | null;
  metadataWritten?: boolean;
  historyWritten?: boolean;
  attachment?: {
    id: string;
    checklistItemId: string;
    name: string;
    url?: string | null;
    mimeType?: string | null;
    size?: number | null;
    source?: string | null;
  } | null;
  warnings: string[];
  errors: string[];
}

export const CHECKLIST_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
