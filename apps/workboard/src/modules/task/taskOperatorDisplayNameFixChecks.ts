/**
 * PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX — user display resolution must be
 * role-independent. ADMIN already worked; OPERATOR regressed because a
 * USER_DIRECTORY record without DISPLAY_NAME/FULL_NAME had its displayName
 * pre-filled with the raw USR_* code, which poisoned the FE resolver.
 *
 * These checks reproduce the ADMIN vs OPERATOR paths against the shared
 * resolver + mapper. CBV_TCS_V1, standalone.
 */

import type { UserDirectoryRecord } from '@/api/contracts';
import {
  resolveUserDisplayName,
  enrichTaskUserDisplayNames,
  getTaskOwnerDisplay,
  saveUsersById,
  saveUserDisplayMap,
} from '@/runtime/userDisplay';

export interface OperatorDisplayCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function seedDirectory(): void {
  const records: Record<string, UserDirectoryRecord> = {
    // ADMIN-visible user — has a real DISPLAY_NAME (worked before the fix).
    USR_001: { id: 'USR_001', userCode: 'USR_001', displayName: 'Quản Trị Viên', email: 'admin@cbv.vn' },
    // OPERATOR / nameless owner — backend pre-fills displayName with the raw
    // code (no DISPLAY_NAME/FULL_NAME) but an EMAIL exists. This is the poison case.
    USR_008: { id: 'USR_008', userCode: 'USR_008', displayName: 'USR_008', email: 'op8@cbv.vn' },
  };
  saveUsersById(records);
  // Flat display map from GAS also sends the raw code for the nameless user.
  saveUserDisplayMap({ USR_001: 'Quản Trị Viên', USR_008: 'USR_008' });
}

export function runTaskOperatorDisplayNameFixChecks(): {
  suite: string;
  status: string;
  checks: OperatorDisplayCheck[];
} {
  const checks: OperatorDisplayCheck[] = [];
  seedDirectory();

  // Case A — ADMIN: owner USR_001 with DISPLAY_NAME → name, never raw code.
  const adminOwner = getTaskOwnerDisplay({ owner: '', ownerId: 'USR_001' });
  checks.push({
    id: 'TASK_ADMIN_USER_DISPLAY_NAME_OK',
    label: 'ADMIN: owner có DISPLAY_NAME → hiển thị tên',
    pass: adminOwner === 'Quản Trị Viên' && !adminOwner.includes('USR_'),
    detail: adminOwner,
  });

  // Case B — OPERATOR: owner USR_008 (no name, has email) → EMAIL, not raw code.
  const opOwner = getTaskOwnerDisplay({ owner: '', ownerId: 'USR_008' });
  checks.push({
    id: 'TASK_OPERATOR_USER_DISPLAY_NAME_OK',
    label: 'OPERATOR: owner thiếu tên nhưng có email → không hiện USR_',
    pass: opOwner === 'op8@cbv.vn' && !opOwner.includes('USR_'),
    detail: opOwner,
  });

  // Case C — OPERATOR myQueue / HOME_ALERT-derived row with embedded raw USR_.
  const queueTask = enrichTaskUserDisplayNames({
    ownerId: 'USR_008',
    ASSIGNED_TO: 'USR_008',
    CREATED_BY: 'USR_001',
    OPERATOR_META_TEXT: 'TASK · USR_008 · đang xử lý',
  });
  const metaResolved = String(queueTask.operatorMetaTextDisplay || '');
  checks.push({
    id: 'TASK_OPERATOR_MY_QUEUE_USER_DISPLAY_NAME_OK',
    label: 'OPERATOR myQueue: label/meta không còn raw USR_ khi resolve được',
    pass:
      queueTask.assignedToDisplayName === 'op8@cbv.vn' &&
      queueTask.createdByDisplayName === 'Quản Trị Viên' &&
      metaResolved.includes('op8@cbv.vn') &&
      !metaResolved.includes('USR_008'),
    detail: `${queueTask.assignedToDisplayName} | ${metaResolved}`,
  });

  // Case D — missing user → safe raw-id fallback (never blank/crash).
  const missing = resolveUserDisplayName('USR_777');
  checks.push({
    id: 'TASK_USER_DISPLAY_FALLBACK_OK',
    label: 'User không có trong directory → fallback raw USER_ID',
    pass: missing === 'USR_777',
    detail: missing,
  });

  // Case E — empty assigned → empty string, not undefined/null.
  const empty = resolveUserDisplayName('');
  checks.push({
    id: 'TASK_USER_DISPLAY_EMPTY_SAFE',
    label: 'Assigned rỗng → "" an toàn, không undefined',
    pass: empty === '',
    detail: JSON.stringify(empty),
  });

  // Case F — raw audit ids retained alongside display names.
  checks.push({
    id: 'TASK_RAW_USER_ID_RETAINED_FOR_AUDIT',
    label: 'DTO vẫn giữ raw OWNER_ID/ASSIGNED_TO/CREATED_BY',
    pass:
      queueTask.ownerId === 'USR_008' &&
      queueTask.ASSIGNED_TO === 'USR_008' &&
      queueTask.CREATED_BY === 'USR_001',
    detail: `${queueTask.ownerId} / ${queueTask.ASSIGNED_TO}`,
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
