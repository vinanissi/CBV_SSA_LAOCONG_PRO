/**
 * PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1 — static contract checks.
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

export function runWorkInboxAttachmentsRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxAttachmentsSection.tsx');
  const hook = readLocal('useWorkInboxAttachmentsRuntime.ts');
  const localState = readLocal('workInboxAttachmentsLocalState.ts');
  const cards = readRoot('modules/task/inbox/focusRuntime/FocusContentCards.tsx');
  const rightTabs = readRoot('modules/task/inbox/focusRuntime/RightContextTabs.tsx');
  const actionHook = readRoot('modules/task/inbox/actionRuntime/useWorkInboxActionRuntime.ts');
  const client = readRoot('api/client.ts');
  const workerMod = readWorker('modules/workInboxAttachments.ts');
  const workerRouter = readWorker('router.ts');
  const workerAdapter = readWorker('adapters/googleSheetWorkInboxOperationalAdapter.ts');
  const gasAtt = readGas('50_WorkInboxAttachments.js');
  const gasOp = readGas('46_WorkInboxOperationalService.js');
  const gasConfig = readGas('04_WorkInboxOperationalConfig.js');

  push('ATTACH_FE_WORKER_API_ONLY', client.includes('listWorkInboxAttachments') && !hook.includes('script.google.com'));
  push('ATTACH_UI_DOSSIER_LAYOUT', rightTabs.includes('DossierAggregatePanel') && cards.includes('isCenterRecentDocumentsVisible'));
  push('ATTACH_DIALOG_HOST', readRoot('modules/task/inbox/attachments/WorkInboxTaskAttachmentDialogHost.tsx').includes('WorkInboxAddAttachmentDialog'));
  push('ATTACH_MORE_MENU_OPENS_DIALOG', actionHook.includes('ACTION_MORE_ATTACH') && actionHook.includes('setAttachDialogOpen(true)'));
  push('ATTACH_LOCAL_PATCH', localState.includes('upsertAttachmentItem') && hook.includes('setItems'));
  push('ATTACH_NO_FULL_SNAPSHOT', !hook.includes('loadWorkspace') && !hook.includes('getTaskWorkspaceSnapshot'));
  push('ATTACH_GAS_SOFT_DELETE', gasAtt.includes('IS_DELETED: true') && gasAtt.includes('wiOpSoftDeleteAttachment_'));
  push('ATTACH_GAS_TIMELINE_AUDIT', gasAtt.includes('ATTACHMENT_ADDED') && gasAtt.includes('ACTION_ATTACHMENT_CREATE'));
  push('ATTACH_GAS_BOOTSTRAP', gasAtt.includes('wiOpEnsureAttachmentSheet_'));
  push(
    'ATTACH_V1_LINK_TEXT_ONLY',
    workerMod.includes("type !== 'LINK' && type !== 'TEXT'") && gasAtt.includes('Upload FILE/IMAGE chưa bật trong V1'),
  );
  push('ATTACH_WORKER_ROUTES', workerRouter.includes('/attachments') && workerMod.includes('handleWorkInboxAttachmentsList'));
  push('ATTACH_GAS_ACTIONS', gasConfig.includes('wiOpListAttachments') && gasOp.includes("case 'wiOpSoftDeleteAttachment'"));
  push('ATTACH_ADAPTER', workerAdapter.includes('gsWiOpListAttachments') && workerAdapter.includes('gsWiOpSoftDeleteAttachment'));
  push('ATTACH_UI_DIALOG', section.includes('WorkInboxAddAttachmentDialog') && section.includes('+ Thêm tài liệu'));
  push('ATTACH_GETRANGE_NUMROWS_FIX', gasAtt.includes('getRange(nextRow, 1, 1, width)'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live GAS deploy + manual browser verification pending');
  warnings.push('FILE/IMAGE upload not enabled in V1');

  return { suite: 'PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1', status, checks, warnings };
}
