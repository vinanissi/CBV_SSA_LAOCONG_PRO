/**
 * PHASE_DOSSIER_04 — cross-focus navigation (UI-only, read-only).
 */

export type DossierFocusSource =
  | 'dossier_attachment'
  | 'dossier_link'
  | 'dossier_feedback'
  | 'dossier_group'
  | 'step_deep_link';

export type DossierFocusItemType = 'attachment' | 'link' | 'feedback';

export interface DossierFocusRequest {
  id: string;
  taskId: string;
  checklistItemId?: string | null;
  dossierItemId?: string | null;
  dossierItemType?: DossierFocusItemType | string;
  source: DossierFocusSource | string;
  behavior: {
    scroll: boolean;
    highlight: boolean;
    expand: boolean;
  };
  createdAt?: string | null;
}

export interface DossierFocusResult {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  taskId: string;
  checklistItemId?: string | null;
  dossierItemId?: string | null;
  focused: boolean;
  scrolled: boolean;
  highlighted: boolean;
  expanded: boolean;
  message?: string | null;
  warnings: string[];
  errors: string[];
}

export const DOSSIER_TASK_LEVEL_FOCUS_MESSAGE =
  'Tài liệu cấp task, không gắn với bước checklist.';

export const DOSSIER_STALE_CHECKLIST_ITEM_MESSAGE =
  'Không tìm thấy bước checklist tương ứng — có thể đã đổi hoặc bị xóa.';
