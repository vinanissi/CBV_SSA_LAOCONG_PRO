import type { TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';

export interface WorkInboxSearchIndexEntry {
  taskId: string;
  title: string;
  status: string;
  position: number;
  assignee: string;
  haystack: string;
  phone?: string;
  licensePlate?: string;
}

const PHONE_RE = /\b0\d{8,10}\b/g;
const LICENSE_RE = /\b\d{2}[A-Z]{1,2}[-.]?\d{3,5}\b/i;

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function extractPhone(text: string): string | undefined {
  const m = text.match(PHONE_RE);
  return m?.[0];
}

function extractLicense(text: string): string | undefined {
  const m = text.match(LICENSE_RE);
  return m?.[0]?.toUpperCase();
}

function taskHaystack(task: TaskItem | undefined, item: WorkInboxFocusItem): string {
  const parts = [
    item.id,
    item.title,
    item.assigneeName,
    task?.displayAssigneeName,
    task?.ownerDisplayName,
    task?.displayOwner,
    task?.displayReporter,
    task?.pendingAction,
    task?.blockReason,
    task?.relatedHoSoId,
    task?.relatedEntityId,
  ];
  return parts.filter(Boolean).join(' ');
}

/** Build local search index from current focus queue + task map (no network). */
export function buildWorkInboxSearchIndex(
  focusItems: WorkInboxFocusItem[],
  tasks: TaskItem[],
): WorkInboxSearchIndexEntry[] {
  const byId = new Map<string, TaskItem>();
  for (const t of tasks) {
    if (t.taskId && t.permissionAllowed !== false) byId.set(t.taskId, t);
  }

  return focusItems
    .filter((item) => {
      const t = byId.get(item.id);
      return t ? t.permissionAllowed !== false : true;
    })
    .map((item, index) => {
      const task = byId.get(item.id);
      const haystackRaw = taskHaystack(task, item);
      return {
        taskId: item.id,
        title: item.title,
        status: item.status,
        position: index + 1,
        assignee: item.assigneeName?.trim() || task?.displayAssigneeName?.trim() || task?.ownerDisplayName?.trim() || 'Chưa gán',
        haystack: normalize(haystackRaw),
        phone: extractPhone(haystackRaw),
        licensePlate: extractLicense(haystackRaw),
      };
    });
}

export function normalizeSearchQuery(query: string): string {
  return normalize(query);
}
