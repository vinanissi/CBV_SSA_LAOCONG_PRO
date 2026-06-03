/**
 * PHASE_CHECKLIST_09 — static schema/bootstrap contract checks (no live Sheet).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHECKLIST_APPEND_ONLY_SHEET_TABS,
  CHECKLIST_SHEET_SCHEMA_MANIFEST,
  CHECKLIST_SHEET_TAB_NAMES,
} from './checklistSheetSchemaManifest';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistSheetSchemaBootstrapChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const gas = readRepo('05_GAS_RUNTIME/51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js');
  const schemaJs = readRepo('05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js');
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_SHEET_SCHEMA_BOOTSTRAP_CONTRACT.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md');

  push('MANIFEST_TAB_COUNT', CHECKLIST_SHEET_TAB_NAMES.length === 8);
  push('MANIFEST_HAS_TASK_CHECKLIST', CHECKLIST_SHEET_TAB_NAMES.includes('TASK_CHECKLIST'));
  push('MANIFEST_SCHEMA_VERSION_COL', CHECKLIST_SHEET_SCHEMA_MANIFEST.TASK_CHECKLIST.includes('SCHEMA_VERSION'));
  push('APPEND_ONLY_TABS', CHECKLIST_APPEND_ONLY_SHEET_TABS.length === 2);
  push('GAS_BOOTSTRAP_FN', gas.includes('function bootstrapChecklistSheetSchema'));
  push('GAS_VALIDATE_FN', gas.includes('function validateChecklistSheetSchema'));
  push('GAS_NON_DESTRUCTIVE', gas.includes('insertSheet') && !gas.includes('deleteSheet'));
  push('GAS_NO_DRIVE', !gas.includes('DriveApp.createFolder') && !gas.includes('OCMS_CHECKLIST_FILES'));
  push('SCHEMA_JS_ALIGNED', schemaJs.includes('CHECKLIST_FEEDBACK') && schemaJs.includes('IS_ARCHIVED'));
  push('CONTRACT_DOC', contract.includes('TASK_CHECKLIST') && contract.includes('append-only'));
  push('ADR_PREREQ', adr.includes('ACCEPTED'));
  push('TASK_DB_CONFIG', readRepo('gas-runtime-api/01_TaskDbConfig.js').includes('CHECKLIST_HISTORY'));
  push('TEST_CONSOLE', readRepo('gas-runtime-api/85_ChecklistSheetSchemaTestConsole.js').includes('CBV_TCS_CHECKLIST_09_validateSchema'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live Google Sheet bootstrap not executed in CI — run CBV_TCS_CHECKLIST_09_* in Task DB Apps Script');
  warnings.push('TASK_CHECKLIST may need safe header extend (SOURCE, SCHEMA_VERSION, IS_ARCHIVED) on production sheet');

  return { suite: 'PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP', status, checks, warnings };
}
