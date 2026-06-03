/**
 * PHASE_CHECKLIST_11 — static Sheet/Drive bridge contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistSheetDriveBridgeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const gas = readRepo('05_GAS_RUNTIME/53_CHECKLIST_SHEET_DRIVE_BRIDGE.js');
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_SHEET_DRIVE_BRIDGE_CONTRACT.md');
  const opSvc = readRepo('gas-runtime-api/46_WorkInboxOperationalService.js');
  const router = readRepo('workers/api/src/router.ts');
  const adapter = readRepo('workers/api/src/adapters/googleSheetWorkInboxOperationalAdapter.ts');

  push('GAS_DISPATCH', gas.includes('function clBridgeDispatch_'));
  push('GAS_VALIDATE', gas.includes('function validateChecklistSheetDriveBridge'));
  push('GAS_READ_ITEMS', gas.includes("case 'readChecklistItems'"));
  push('GAS_APPEND_FEEDBACK', gas.includes("case 'appendFeedback'"));
  push('GAS_APPEND_HISTORY', gas.includes("case 'appendHistory'"));
  push('GAS_DRIVE_ENSURE', gas.includes("case 'ensureChecklistItemDriveFolder'"));
  push('GAS_NON_DESTRUCTIVE', !gas.includes('deleteSheet') && !gas.includes('deleteFile'));
  push('GAS_NO_UPLOAD', !gas.includes('createFile('));
  push('GAS_DELEGATES_ITEMS', gas.includes('wiOpListChecklist_'));
  push('ROUTER_WIOP', opSvc.includes("case 'wiOpClBridge'"));
  push('WORKER_ROUTE', router.includes('checklist-bridge'));
  push('WORKER_ADAPTER', adapter.includes('gsWiOpClBridge'));
  push('FE_BRIDGE_CONFIG', readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistBridgeConfig.ts').includes('isChecklistSheetBridgeEnabled'));
  push(
    'FE_BRIDGE_DEFAULT_OFF',
    readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistBridgeConfig.ts').includes(
      'return false',
    ),
  );
  push('FE_HOOKS_WIRED', readRepo('apps/workboard/src/modules/task/inbox/checklist/useChecklistFeedbackRuntime.ts').includes('loadChecklistFeedbackFromBridge'));
  push('CONTRACT_DOC', contract.includes('readChecklistItems') && contract.includes('appendHistory'));
  push('TEST_CONSOLE', readRepo('gas-runtime-api/87_ChecklistSheetDriveBridgeTestConsole.js').includes('CBV_TCS_CHECKLIST_11'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Bridge feature flag defaults off — set VITE_CHECKLIST_SHEET_BRIDGE_ENABLED=true or localStorage cbv-checklist-sheet-bridge:v1');
  warnings.push('Live Sheet/Drive bridge not executed in CI');

  return { suite: 'PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION', status, checks, warnings };
}
