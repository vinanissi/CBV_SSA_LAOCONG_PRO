/**
 * PHASE_CHECKLIST_10 — static Drive folder bootstrap checks (no live Drive).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildChecklistItemFolderName,
  buildChecklistTaskFolderName,
  CHECKLIST_DRIVE_ROOT_FOLDER_NAME,
  sanitizeChecklistDriveSegment,
} from './checklistDriveFolderManifest';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistDriveFolderBootstrapChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const gas = readRepo('05_GAS_RUNTIME/52_CHECKLIST_DRIVE_FOLDER_BOOTSTRAP.js');
  const contract = readRepo(
    '00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_DRIVE_FOLDER_BOOTSTRAP_CONTRACT.md',
  );
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md');

  push('ROOT_NAME', CHECKLIST_DRIVE_ROOT_FOLDER_NAME === 'OCMS_CHECKLIST_FILES');
  const taskName = buildChecklistTaskFolderName('TASK-001');
  push('TASK_FOLDER_DETERMINISTIC', taskName.ok && taskName.folderName === 'TASK_TASK-001');
  const itemName = buildChecklistItemFolderName('CL-99');
  push('ITEM_FOLDER_DETERMINISTIC', itemName.ok && itemName.folderName === 'ITEM_CL-99');
  push('MISSING_TASK_ID', !buildChecklistTaskFolderName('').ok);
  push('MISSING_ITEM_ID', !buildChecklistItemFolderName('  ').ok);
  push('SANITIZE_SLASH', sanitizeChecklistDriveSegment('a/b', 'x').ok);

  push('GAS_BOOTSTRAP_FN', gas.includes('function bootstrapChecklistDriveFolders'));
  push('GAS_VALIDATE_FN', gas.includes('function validateChecklistDriveFolders'));
  push('GAS_NON_DESTRUCTIVE', !gas.includes('deleteFolder') && !gas.includes('removeFile'));
  push('GAS_NO_UPLOAD', !gas.includes('createFile(') && !gas.includes('uploadFile'));
  push('GAS_NO_BRIDGE', !gas.includes('CHECKLIST_ATTACHMENTS') && !gas.includes('SpreadsheetApp'));
  push('GAS_NO_PUBLIC_SHARE', !gas.includes('setSharing'));
  push('CONTRACT_DOC', contract.includes('OCMS_CHECKLIST_FILES') && contract.includes('TASK_'));
  push('ADR_PREREQ', adr.includes('ACCEPTED'));
  push('TEST_CONSOLE', readRepo('gas-runtime-api/86_ChecklistDriveFolderTestConsole.js').includes('CBV_TCS_CHECKLIST_10'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live Google Drive bootstrap not executed in CI — run CBV_TCS_CHECKLIST_10_* in GAS');
  warnings.push('Set CBV_CHECKLIST_DRIVE_ROOT_FOLDER_ID or parent CBV_OPERATIONAL_DRIVE_ROOT_FOLDER_ID before prod');

  return { suite: 'PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP', status, checks, warnings };
}
