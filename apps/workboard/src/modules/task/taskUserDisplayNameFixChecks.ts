/**
 * PHASE_TASK_USER_DISPLAY_NAME_FIX — operational task cards must render
 * USER_DIRECTORY DISPLAY_NAME / FULL_NAME / EMAIL instead of raw USER_ID,
 * with a safe fallback to the raw id when no directory record exists.
 *
 * CBV_TCS_V1 check suite. Standalone (no business menu coupling).
 */

import type { TaskItem, UserDirectoryRecord } from '@/api/contracts';
import {
  getTaskOwnerDisplay,
  getCardOwnerMetaShort,
  saveUsersById,
} from '@/runtime/userDisplay';

export interface TaskUserDisplayCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function ownerTask(ownerId: string): TaskItem {
  return {
    taskId: 't-' + (ownerId || 'none'),
    title: 'Việc vận hành test',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    owner: ownerId,
    ownerId,
    dueDate: '2026-05-29',
    href: '/tasks/t',
    permissionAllowed: true,
    module: 'TASK',
    source: 'test',
  } as TaskItem;
}

function seed(record: Partial<UserDirectoryRecord> & { id: string; userCode: string }): void {
  saveUsersById({
    [record.id]: {
      displayName: '',
      ...record,
    } as UserDirectoryRecord,
  });
}

export function runTaskUserDisplayNameFixChecks(): {
  suite: string;
  status: string;
  checks: TaskUserDisplayCheck[];
} {
  const checks: TaskUserDisplayCheck[] = [];

  // Case 1 — DISPLAY_NAME present → show DISPLAY_NAME, never raw code.
  seed({ id: 'USR_801', userCode: 'USR_801', displayName: 'Nguyễn Văn A' });
  const c1 = getTaskOwnerDisplay(ownerTask('USR_801'));
  checks.push({
    id: 'TASK_USER_DISPLAY_NAME_RESOLVED',
    label: 'DISPLAY_NAME hiển thị thay cho USER_ID',
    pass: c1 === 'Nguyễn Văn A',
    detail: c1,
  });

  // Case 2 — no DISPLAY_NAME but FULL_NAME present → show FULL_NAME.
  seed({ id: 'USR_802', userCode: 'USR_802', displayName: '', fullName: 'Trần Thị B' });
  const c2 = getTaskOwnerDisplay(ownerTask('USR_802'));
  checks.push({
    id: 'TASK_USER_DISPLAY_FULLNAME_FALLBACK',
    label: 'Thiếu DISPLAY_NAME → dùng FULL_NAME',
    pass: c2 === 'Trần Thị B' && !c2.includes('USR_'),
    detail: c2,
  });

  // Case 3 — only EMAIL → show EMAIL (human-readable) instead of raw code.
  seed({ id: 'USR_803', userCode: 'USR_803', displayName: '', email: 'user803@cbv.vn' });
  const c3 = getTaskOwnerDisplay(ownerTask('USR_803'));
  checks.push({
    id: 'TASK_USER_DISPLAY_EMAIL_FALLBACK',
    label: 'Chỉ có EMAIL → dùng EMAIL thay cho USER_ID',
    pass: c3 === 'user803@cbv.vn' && !c3.includes('USR_'),
    detail: c3,
  });

  // Case 4 — no directory record → safe fallback to raw USER_ID (not blank/undefined).
  const c4 = getTaskOwnerDisplay(ownerTask('USR_899'));
  checks.push({
    id: 'TASK_USER_DISPLAY_FALLBACK_SAFE',
    label: 'Không có record → fallback raw USER_ID an toàn',
    pass: c4 === 'USR_899',
    detail: c4,
  });

  // Case 5 — empty owner → "Chưa giao", never undefined/null.
  const c5 = getTaskOwnerDisplay(ownerTask(''));
  checks.push({
    id: 'TASK_USER_DISPLAY_UNASSIGNED_SAFE',
    label: 'ASSIGNED_TO rỗng → "Chưa giao", không undefined',
    pass: c5 === 'Chưa giao',
    detail: c5,
  });

  // Card meta surface must not leak raw USR_ when a name is resolvable.
  const metaShort = getCardOwnerMetaShort(ownerTask('USR_801'));
  checks.push({
    id: 'TASK_USER_ID_NOT_RENDERED_WHEN_DISPLAY_NAME_EXISTS',
    label: 'Meta card không hiển thị USR_ khi đã có DISPLAY_NAME',
    pass: metaShort.includes('Nguyễn Văn A') && !metaShort.includes('USR_'),
    detail: metaShort,
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_USER_DISPLAY_NAME_FIX',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
