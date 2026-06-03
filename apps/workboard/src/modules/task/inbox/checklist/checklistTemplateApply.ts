/**
 * PHASE_CHECKLIST_07 — append template items to task checklist (no delete existing).
 */

import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';
import type { ChecklistTemplate, ChecklistTemplateApplyOperation } from './checklistTemplateTypes';

export function makeChecklistTemplateApplyId(): string {
  return `tpl-apply-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface ApplyChecklistTemplateOptions {
  template: ChecklistTemplate;
  taskId: string;
  actor?: string | null;
  currentMaxSortOrder: number;
  createItem: (
    title: string,
    opts?: { sortOrder?: number },
  ) => Promise<{ ok: boolean; item?: WorkInboxChecklistItem; error?: string }>;
  setNote?: (checklistItemId: string, note: string) => void;
  markDone?: (checklistItemId: string) => Promise<{ ok: boolean }>;
  mode?: 'append' | string;
}

export interface ApplyChecklistTemplateResult {
  ok: boolean;
  operation?: ChecklistTemplateApplyOperation;
  createdIds: string[];
  error?: string;
}

/** Append template steps after existing checklist items. */
export async function applyChecklistTemplateAppend(
  options: ApplyChecklistTemplateOptions,
): Promise<ApplyChecklistTemplateResult> {
  const template = options.template;
  const items = Array.isArray(template.items) ? template.items : [];
  if (items.length === 0) {
    return { ok: false, createdIds: [], error: 'Mẫu không có bước nào' };
  }

  const mode = options.mode ?? 'append';
  if (mode !== 'append') {
    return { ok: false, createdIds: [], error: 'Chế độ áp dụng chưa hỗ trợ' };
  }

  const createdIds: string[] = [];
  let sortOrder = Number.isFinite(options.currentMaxSortOrder)
    ? options.currentMaxSortOrder
    : 0;

  const sortedTemplateItems = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  for (const step of sortedTemplateItems) {
    const title = step.title?.trim();
    if (!title) continue;
    sortOrder += 1;
    const res = await options.createItem(title, { sortOrder });
    if (!res.ok || !res.item?.checklistId) {
      return {
        ok: false,
        createdIds,
        error: res.error ?? 'Không tạo được bước từ mẫu',
      };
    }
    const checklistId = res.item.checklistId;
    createdIds.push(checklistId);

    const note = step.note?.trim();
    if (note) options.setNote?.(checklistId, note);

    const status = (step.defaultStatus ?? 'todo').toLowerCase();
    if (status === 'done' && options.markDone) {
      await options.markDone(checklistId);
    }
  }

  const operation: ChecklistTemplateApplyOperation = {
    id: makeChecklistTemplateApplyId(),
    templateId: template.id,
    taskId: options.taskId.trim(),
    mode: 'append',
    actor: options.actor ?? null,
    createdAt: new Date().toISOString(),
    createdChecklistItemIds: createdIds,
  };

  return { ok: true, operation, createdIds };
}
