/**
 * PHASE_DOSSIER_05 — safe dossier item actions (non-destructive).
 */

export type DossierActionType =
  | 'open_item'
  | 'copy_link'
  | 'open_drive_file'
  | 'focus_checklist_item'
  | 'view_source_context';

export type DossierActionSource =
  | 'dossier_attachment'
  | 'dossier_link'
  | 'dossier_feedback'
  | 'dossier_task_attachment'
  | string;

export interface DossierAction {
  id: string;
  dossierItemId: string;
  type: DossierActionType | string;
  label: string;
  enabled: boolean;
  reasonDisabled?: string | null;
  targetUrl?: string | null;
  driveFileId?: string | null;
  checklistItemId?: string | null;
  source: DossierActionSource;
}

export interface DossierActionResult {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  actionId: string;
  dossierItemId: string;
  actionType: string;
  performed: boolean;
  message?: string | null;
  warnings: string[];
  errors: string[];
}
