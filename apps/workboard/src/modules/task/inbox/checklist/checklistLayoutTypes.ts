/**
 * PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME — per-item and list layout state.
 */

export interface ChecklistLayoutState {
  checklistItemId: string;
  expanded: boolean;
  lastOpenedAt?: string | null;
  updatedAt?: string | null;
}

export interface ChecklistListLayoutState {
  taskId: string;
  expandedItemIds: string[];
  archivedVisible: boolean;
  updatedAt?: string | null;
}
