/**
 * PHASE_CHECKLIST_12 — local runtime → Sheet/Drive migration types.
 */

export type MigrationStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
export type MigrationRecordStatus = 'PENDING' | 'MIGRATED' | 'SKIPPED' | 'FAILED';
export type MigrationOperation =
  | 'append'
  | 'upsert'
  | 'skip_duplicate'
  | 'skip_invalid'
  | 'dry_run'
  | string;

export interface MigrationInput {
  taskId?: string | null;
  checklistItemIds?: string[];
  includeFeedback: boolean;
  includeAttachments: boolean;
  includeLinks: boolean;
  includeHistory: boolean;
  includeTemplates: boolean;
  includeLayoutState: boolean;
  includeCrudOverlay: boolean;
  dryRun: boolean;
  /** Required true for commit (non-dry-run) */
  commitConfirmed?: boolean;
  actor?: string | null;
  traceId?: string | null;
}

export interface MigrationRecord {
  source: 'localStorage' | 'local_runtime' | string;
  sourceKey: string;
  sourceId: string;
  targetTabOrRole: string;
  targetId: string;
  operation: MigrationOperation;
  status: MigrationRecordStatus;
  warnings?: string[];
  errors?: string[];
}

export interface MigrationResult {
  ok: boolean;
  status: MigrationStatus;
  traceId: string;
  dryRun: boolean;
  checkedAt: string;
  migratedCount: number;
  skippedCount: number;
  failedCount: number;
  records: MigrationRecord[];
  warnings: string[];
  errors: string[];
  rollbackNotes?: string[];
  exportPathOrKey?: string | null;
}

export interface MigrationInspectionResult {
  ok: boolean;
  taskIds: string[];
  tasks: Record<string, LocalRuntimeTaskBundle>;
  warnings: string[];
}

export interface LocalRuntimeTaskBundle {
  taskId: string;
  feedbackKeys: number;
  attachmentKeys: number;
  linkKeys: number;
  historyKeys: number;
  crudOverlayKeys: number;
  hasLayout: boolean;
}

export interface MigrationExportResult {
  ok: boolean;
  version: number;
  exportedAt: string;
  taskIds: string[];
  payload: MigrationExportPayload;
}

export interface MigrationExportPayload {
  version: number;
  exportedAt: string;
  tasks: Record<string, MigrationExportTaskData>;
}

export interface MigrationExportTaskData {
  feedback: import('./checklistFeedbackTypes').ChecklistFeedbackByItemId;
  attachments: import('./checklistAttachmentTypes').ChecklistAttachmentByItemId;
  links: import('./checklistLinkTypes').ChecklistLinkByItemId;
  history: import('./checklistHistoryTypes').ChecklistHistoryByItemId;
  crudOverlay: import('./checklistCrudOverlayTypes').ChecklistCrudOverlayByItemId;
  layout: import('./checklistLayoutTypes').ChecklistListLayoutState | null;
}

export interface MigrationValidationResult {
  ok: boolean;
  status: MigrationStatus;
  checkedAt: string;
  traceId: string;
  localRuntime: { readable: boolean; taskCount: number };
  bridge: { available: boolean; enabled: boolean };
  migration: { dryRunAvailable: boolean; commitGuarded: boolean };
  warnings: string[];
  errors: string[];
  nextStep: string;
}
