/**
 * PHASE_CHECKLIST_14 — static multi-user sync checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistMultiUserSyncChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const runtime = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistMultiUserSyncRuntime.ts');
  const hook = readRepo('apps/workboard/src/modules/task/inbox/checklist/useChecklistMultiUserSyncRuntime.ts');
  const ui = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistSyncStatusBar.tsx');
  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
  const bridge = readRepo('gas-runtime-api/53_ChecklistSheetDriveBridge.js');
  const gas = readRepo('gas-runtime-api/56_ChecklistMultiUserSync.js');

  push('SYNC_REFRESH', runtime.includes('refreshChecklistFromRemote'));
  push('SYNC_COMPARE', runtime.includes('compareChecklistLocalRemote'));
  push('SYNC_GUARD', runtime.includes('guardChecklistWrite'));
  push('SYNC_VALIDATE', runtime.includes('validateChecklistMultiUserSyncRuntime'));
  push('BRIDGE_READ_LAYOUT', bridge.includes("case 'readLayoutState'"));
  push('REMOTE_SNAPSHOT', readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistRemoteSnapshot.ts').includes('fetchChecklistRemoteSnapshot'));
  push('UI_SYNC_BTN', ui.includes('Đồng bộ'));
  push('UI_STATUS', ui.includes('Trạng thái:'));
  push(
    'UI_WIRED',
    section.includes('useChecklistSyncFooterPublisher') &&
      readRepo('apps/workboard/src/components/runtime/RuntimeStatusBar.tsx').includes(
        'ChecklistSyncFooterIndicator',
      ) &&
      section.includes('checkWriteGuard'),
  );
  push('HISTORY_REFRESH', section.includes("type: 'manual_refresh_performed'"));
  push('HISTORY_BLOCKED', section.includes('write_blocked_due_to_stale_state'));
  push('NO_BG_POLL', !hook.includes('setInterval') && !runtime.includes('setInterval'));
  push('CONTRACT_DOC', readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_MULTI_USER_SYNC_CONTRACT.md').includes('refreshChecklistFromRemote'));
  push('GAS_VALIDATE', gas.includes('validateChecklistMultiUserSyncRuntime'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live multi-user sync not executed in CI');
  warnings.push('Manual refresh only — no background polling');

  return { suite: 'PHASE_CHECKLIST_14_MULTI_USER_SYNC', status, checks, warnings };
}
