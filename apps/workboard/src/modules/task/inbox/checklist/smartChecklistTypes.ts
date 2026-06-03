/**
 * PHASE_CHECKLIST_01_SMART_CHECKLIST — Smart Checklist Item (UI / read-model foundation).
 * PHASE_CHECKLIST_02_FEEDBACK — feedback stream on item.
 */

import type { ChecklistAttachment } from './checklistAttachmentTypes';
import type { ChecklistFeedback } from './checklistFeedbackTypes';
import type { ChecklistInlineAction } from './checklistInlineActionTypes';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import type { ChecklistLink } from './checklistLinkTypes';

export type SmartChecklistItemStatus = 'todo' | 'done' | 'blocked' | 'skipped' | string;

export interface SmartChecklistItem {
  id: string;
  taskId: string;
  title: string;
  status: SmartChecklistItemStatus;
  note?: string;
  responseCount: number;
  attachmentCount: number;
  linkCount: number;
  updatedBy?: string | null;
  updatedAt?: string | null;
  /** Operational processing notes (phase 02); default [] */
  feedback?: ChecklistFeedback[];
  /** Operational evidence refs (phase 03); default [] */
  attachments?: ChecklistAttachment[];
  /** Derived inline affordances (phase 03B); not persisted */
  inlineActions?: ChecklistInlineAction[];
  /** Operational links (phase 04); default [] */
  links?: ChecklistLink[];
  /** Append-only activity log (phase 05); default [] */
  history?: ChecklistHistoryEntry[];
  historyCount?: number;
  latestHistoryAt?: string | null;
  /** Display order (phase 06); default from list index */
  sortOrder?: number;
  /** Soft-archive overlay (phase 06); default false */
  isArchived?: boolean;
  /** Row layout expanded (phase 06); from local layout state */
  layoutExpanded?: boolean;
}
