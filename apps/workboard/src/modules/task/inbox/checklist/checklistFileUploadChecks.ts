/**
 * PHASE_CHECKLIST_13 — static file upload runtime checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistFileUploadChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const gas = readRepo('gas-runtime-api/55_ChecklistFileUpload.js');
  const gasProd = readRepo('05_GAS_RUNTIME/55_CHECKLIST_FILE_UPLOAD.js');
  const bridge = readRepo('gas-runtime-api/53_ChecklistSheetDriveBridge.js');
  const panel = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistAttachmentPanel.tsx');
  const runtime = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFileUploadRuntime.ts');
  const types = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFileUploadTypes.ts');
  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');

  push('GAS_UPLOAD_FN', gas.includes('clBridgeUploadChecklistFile_'));
  push('GAS_PROD_SYNC', gasProd.includes('clBridgeUploadChecklistFile_'));
  push('GAS_VALIDATE', gas.includes('validateChecklistFileUploadRuntime'));
  push('GAS_NO_OVERWRITE', gas.includes('getFilesByName') && !gas.includes('.setTrashed'));
  push('GAS_NO_PUBLIC', !gas.includes('setSharing'));
  push('GAS_METADATA_AFTER_DRIVE', gas.indexOf('createFile') < gas.indexOf('clBridgeAppendAttachmentMetadata_'));
  push('BRIDGE_DISPATCH', bridge.includes("case 'uploadChecklistFile'"));
  push('FE_VALIDATE', runtime.includes('validateChecklistUpload'));
  push('FE_UPLOAD', runtime.includes('uploadChecklistFile'));
  push('FE_MAX_SIZE', types.includes('10 * 1024 * 1024'));
  push('UI_UPLOAD_BTN', panel.includes('Tải tệp lên'));
  push('UI_WIRE_UPLOAD', section.includes('onUploadAttachmentFile') && section.includes('uploadFile'));
  push('HISTORY_UPLOAD', section.includes("type: 'file_uploaded'"));
  const effectBlocks = panel.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,/g) ?? [];
  const autoUploadInEffect = effectBlocks.some((b) => b.includes('onUploadFile'));
  push('NO_AUTO_UPLOAD', !autoUploadInEffect && panel.includes('handleUploadPick'));
  push('SAFE_FILENAME', runtime.includes('buildSafeChecklistUploadFileName'));
  push('MISSING_TASK_ID', runtime.includes("errors.push('taskId is required')"));
  push('CONTRACT_DOC', readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_FILE_UPLOAD_CONTRACT.md').includes('uploadChecklistFile'));
  push('TEST_CONSOLE', readRepo('05_GAS_RUNTIME/55A_CHECKLIST_FILE_UPLOAD_TEST_CONSOLE.js').includes('CBV_TCS_CHECKLIST_13'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live Drive upload not executed in CI');
  warnings.push('Max file size 10MB; bridge flag must be on');

  return { suite: 'PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME', status, checks, warnings };
}
