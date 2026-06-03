/**
 * PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME — local overlay (note, archive).
 */

export interface ChecklistItemCrudOverlay {
  note?: string;
  isArchived?: boolean;
  updatedAt?: string | null;
}

export type ChecklistCrudOverlayByItemId = Record<string, ChecklistItemCrudOverlay>;
