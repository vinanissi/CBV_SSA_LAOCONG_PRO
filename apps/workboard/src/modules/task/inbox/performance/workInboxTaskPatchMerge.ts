/** PHASE_WORK_INBOX_LATENCY_P1 — merge slim taskPatch into active task detail. */

import type { TaskDetail } from '@/api/contracts';

const SLIM_PATCH_KEYS = [
  'taskId',
  'title',
  'status',
  'priority',
  'owner',
  'ownerId',
  'displayOwner',
  'updatedAt',
  'pendingAction',
  'slaStatus',
  'href',
  'permissionAllowed',
] as const;

export function mergeWorkInboxTaskPatch(
  existing: TaskDetail | null | undefined,
  patch: TaskDetail | Partial<TaskDetail>,
): TaskDetail {
  if (!existing) return patch as TaskDetail;
  const merged = { ...existing };
  for (const key of SLIM_PATCH_KEYS) {
    const v = patch[key as keyof typeof patch];
    if (v !== undefined && v !== null && v !== '') {
      (merged as unknown as Record<string, unknown>)[key] = v;
    }
  }
  if (patch.status) merged.status = patch.status;
  return merged;
}

export function isSlimTaskPatch(patch: Partial<TaskDetail>): boolean {
  const keys = Object.keys(patch);
  return keys.length > 0 && keys.every((k) => (SLIM_PATCH_KEYS as readonly string[]).includes(k));
}
