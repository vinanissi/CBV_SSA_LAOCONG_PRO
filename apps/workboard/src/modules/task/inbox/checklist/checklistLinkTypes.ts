/**
 * PHASE_CHECKLIST_04_LINKS — operational links per checklist item.
 */

export type ChecklistLinkType =
  | 'zalo'
  | 'drive'
  | 'sheet'
  | 'form'
  | 'internal'
  | 'external'
  | string;

export type ChecklistLinkSource = 'manual' | 'existing_document' | 'existing_record' | string;

export interface ChecklistLink {
  id: string;
  checklistItemId: string;
  label: string;
  url: string;
  type?: ChecklistLinkType;
  description?: string | null;
  source?: ChecklistLinkSource;
  createdBy?: string | null;
  createdAt?: string | null;
}

export type ChecklistLinkByItemId = Record<string, ChecklistLink[]>;

export interface RegisterChecklistLinkInput {
  label: string;
  url: string;
  description?: string | null;
  type?: ChecklistLinkType;
  source?: ChecklistLinkSource;
}
