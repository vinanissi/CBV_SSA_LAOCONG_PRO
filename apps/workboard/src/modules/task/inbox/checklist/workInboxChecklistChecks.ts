/**
 * PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

function readWorker(rel: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'workers', 'api', 'src', rel),
    'utf8',
  );
}

function readGas(name: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'gas-runtime-api', name),
    'utf8',
  );
}

export function runWorkInboxChecklistRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxChecklistSection.tsx');
  const hook = readLocal('useWorkInboxChecklistRuntime.ts');
  const localState = readLocal('workInboxChecklistLocalState.ts');
  const cards = readRoot('modules/task/inbox/focusRuntime/FocusContentCards.tsx');
  const client = readRoot('api/client.ts');
  const workerMod = readWorker('modules/workInboxChecklist.ts');
  const workerRouter = readWorker('router.ts');
  const workerAdapter = readWorker('adapters/googleSheetWorkInboxOperationalAdapter.ts');
  const gasChecklist = readGas('49_WorkInboxChecklist.js');
  const gasAppendFast = readGas('13_WorkInboxAppendFast.js');
  const gasOp = readGas('46_WorkInboxOperationalService.js');
  const gasConfig = readGas('04_WorkInboxOperationalConfig.js');

  push('CHECKLIST_FE_WORKER_API_ONLY', client.includes('listWorkInboxChecklist') && !hook.includes('script.google.com'));
  push('CHECKLIST_NO_DEFAULT_STUB', !cards.includes('DEFAULT_CHECKLIST') && cards.includes('WorkInboxChecklistSection'));
  push('CHECKLIST_LOCAL_PATCH', localState.includes('upsertChecklistItem') && hook.includes('setItems'));
  push('CHECKLIST_NO_FULL_SNAPSHOT', !hook.includes('loadWorkspace') && !hook.includes('getTaskWorkspaceSnapshot'));
  push('CHECKLIST_GAS_SOFT_DELETE', gasChecklist.includes('IS_DELETED: true') && gasChecklist.includes('wiOpSoftDeleteChecklistItem_'));
  push('CHECKLIST_GAS_TIMELINE_AUDIT', gasChecklist.includes('ACTION_CHECKLIST_CREATE') && gasChecklist.includes('wiOpAppendChecklistTimelineAudit_'));
  push('CHECKLIST_GAS_BOOTSTRAP', gasChecklist.includes('wiOpEnsureChecklistSheet_'));
  push('CHECKLIST_WORKER_ROUTES', workerRouter.includes('/checklist') && workerMod.includes('handleWorkInboxChecklistList'));
  push('CHECKLIST_GAS_ACTIONS', gasConfig.includes('wiOpListChecklist') && gasOp.includes("case 'wiOpToggleChecklistItem'"));
  push('CHECKLIST_ADAPTER', workerAdapter.includes('gsWiOpListChecklist') && workerAdapter.includes('gsWiOpSoftDeleteChecklistItem'));
  push('CHECKLIST_UI_ADD_TOGGLE', section.includes('+ Thêm mục') && section.includes('toggleItem'));
  push('CHECKLIST_TITLE_VALIDATION', gasChecklist.includes("title là bắt buộc") && workerMod.includes('title là bắt buộc'));
  push(
    'CHECKLIST_APPEND_ROW_WIDTH_HOTFIX',
    gasChecklist.includes('wiOpAppendChecklistRow_') &&
      !gasChecklist.includes('wiOpAppendRowFast_(info, record') &&
      gasAppendFast.includes('wiOpBuildSheetRowPhysical_') &&
      gasAppendFast.includes('headerRow.length'),
  );
  push(
    'CHECKLIST_GETRANGE_NUMROWS_FIX',
    gasChecklist.includes('getRange(nextRow, 1, 1, width)') &&
      gasAppendFast.includes('getRange(nextRow, 1, 1, width)') &&
      !gasChecklist.includes('getRange(nextRow, 1, nextRow, width)'),
  );

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live GAS deploy + manual browser verification pending');

  return { suite: 'PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1', status, checks, warnings };
}
