/**
 * PHASE_CHECKLIST_03_ATTACHMENTS — operational evidence per checklist item.
 */

export type ChecklistAttachmentSource =
  | 'local'
  | 'url'
  | 'drive'
  | 'existing_document'
  | string;

export interface ChecklistAttachment {
  id: string;
  checklistItemId: string;
  name: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
  source?: ChecklistAttachmentSource;
  createdBy?: string | null;
  createdAt?: string | null;
}

export type ChecklistAttachmentByItemId = Record<string, ChecklistAttachment[]>;

export interface RegisterChecklistAttachmentInput {
  name: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
  source?: ChecklistAttachmentSource;
}
