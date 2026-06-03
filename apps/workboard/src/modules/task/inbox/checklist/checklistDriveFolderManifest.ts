/**
 * PHASE_CHECKLIST_10 — Drive folder naming (mirrors GAS checklist Drive bootstrap).
 */

export const CHECKLIST_DRIVE_ROOT_FOLDER_NAME = 'OCMS_CHECKLIST_FILES';

export const CHECKLIST_DRIVE_SCRIPT_PROP_ROOT = 'CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID';
export const CHECKLIST_DRIVE_SCRIPT_PROP_PARENT = 'CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID';

const INVALID_SEGMENT_CHARS = /[\/\\?%*:|"<>]/g;

export function sanitizeChecklistDriveSegment(
  value: string | null | undefined,
  label = 'id',
): { ok: true; segment: string } | { ok: false; error: string } {
  const s = String(value ?? '').trim();
  if (!s) {
    return { ok: false, error: `${label} is required` };
  }
  let segment = s.replace(INVALID_SEGMENT_CHARS, '_').replace(/\s+/g, '_');
  if (segment.length > 180) {
    segment = segment.slice(0, 180);
  }
  return { ok: true, segment };
}

export function buildChecklistTaskFolderName(
  taskId: string,
): { ok: true; folderName: string } | { ok: false; error: string } {
  const r = sanitizeChecklistDriveSegment(taskId, 'taskId');
  if (!r.ok) return r;
  return { ok: true, folderName: `TASK_${r.segment}` };
}

export function buildChecklistItemFolderName(
  checklistItemId: string,
): { ok: true; folderName: string } | { ok: false; error: string } {
  const r = sanitizeChecklistDriveSegment(checklistItemId, 'checklistItemId');
  if (!r.ok) return r;
  return { ok: true, folderName: `ITEM_${r.segment}` };
}

/** Logical path segments (no Drive API). */
export function buildChecklistDriveLogicalPath(taskId: string, checklistItemId?: string): string {
  const task = buildChecklistTaskFolderName(taskId);
  if (!task.ok) return `${CHECKLIST_DRIVE_ROOT_FOLDER_NAME}/`;
  if (!checklistItemId) {
    return `${CHECKLIST_DRIVE_ROOT_FOLDER_NAME}/${task.folderName}/`;
  }
  const item = buildChecklistItemFolderName(checklistItemId);
  if (!item.ok) {
    return `${CHECKLIST_DRIVE_ROOT_FOLDER_NAME}/${task.folderName}/`;
  }
  return `${CHECKLIST_DRIVE_ROOT_FOLDER_NAME}/${task.folderName}/${item.folderName}/`;
}
