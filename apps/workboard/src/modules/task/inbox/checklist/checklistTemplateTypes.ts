/**
 * PHASE_CHECKLIST_07_TEMPLATE_RUNTIME — template read model (static/local).
 */

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  note?: string | null;
  sortOrder?: number;
  defaultStatus?: 'todo' | 'done' | 'blocked' | 'skipped' | string;
  required?: boolean;
  tags?: string[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  version?: string | null;
  items: ChecklistTemplateItem[];
  isActive?: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ChecklistTemplateApplyMode = 'append' | 'replace_preview_only' | string;

export interface ChecklistTemplateApplyOperation {
  id: string;
  templateId: string;
  taskId: string;
  mode: ChecklistTemplateApplyMode;
  actor?: string | null;
  createdAt?: string | null;
  createdChecklistItemIds?: string[];
}
