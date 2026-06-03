/**
 * PHASE_DOSSIER_01 — aggregate read model types (read-only).
 */

export type DossierGroupType = 'task_level' | 'checklist_item' | 'unknown';

export type DossierItemType = 'attachment' | 'link' | 'feedback';

export type DossierItemSource =
  | 'task_attachment'
  | 'checklist_attachment'
  | 'checklist_link'
  | 'checklist_feedback';

export interface DossierItem {
  id: string;
  type: DossierItemType;
  title: string;
  description?: string | null;
  url?: string | null;
  driveFileId?: string | null;
  driveUrl?: string | null;
  source: DossierItemSource;
  taskId: string;
  checklistItemId?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface DossierGroup {
  id: string;
  type: DossierGroupType;
  title: string;
  checklistItemId?: string | null;
  checklistItemTitle?: string | null;
  checklistItemStatus?: string | null;
  items: DossierItem[];
}

export interface DossierCounts {
  taskAttachments: number;
  checklistAttachments: number;
  checklistLinks: number;
  checklistFeedback: number;
  totalDossierItems: number;
}

export interface DossierAggregate {
  taskId: string;
  counts: DossierCounts;
  groups: DossierGroup[];
}

export interface DossierAggregateResult {
  aggregate: DossierAggregate;
  warnings: string[];
}

export interface DossierAggregateValidationResult {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checkedAt: string;
  traceId: string;
  contract: { complete: boolean };
  ui: { dossierTab: boolean };
  warnings: string[];
  errors: string[];
  nextStep: string;
}
