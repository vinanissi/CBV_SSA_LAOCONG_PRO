/**
 * PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1 — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTaskCreationInput } from './buildTaskCreationPayload';
import { resolveTaskCreationCatalog } from './resolveTaskCreationCatalog';
import { DEFAULT_CREATE_FORM } from './workInboxCreateTaskTypes';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readGas(name: string): string {
  return readFileSync(join(repoRoot, 'gas-runtime-api', name), 'utf8');
}

export function runTaskCreationMinimalInputAutofillV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const schemas = readLocal('taskCreationMinimalInputSchemas.ts');
  const builder = readLocal('buildTaskCreationPayload.ts');
  const catalog = readLocal('resolveTaskCreationCatalog.ts');
  const dialog = readLocal('WorkInboxCreateTaskDialog.tsx');
  const hook = readLocal('useWorkInboxCreateTaskRuntime.ts');
  const gasCreate = readGas('48_WorkInboxCreateTask.js');
  const gasDb = readGas('40_TaskDbService.js');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/TASK_CREATION_MINIMAL_INPUT_AUTOFILL_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1.md');

  const multiUnitCatalog = resolveTaskCreationCatalog({
    userId: 'U1',
    displayName: 'Op',
    role: 'USER',
    permissions: [],
  });

  push('INPUT_SCHEMA', schemas.includes('TASK_CREATION_INPUT_SCHEMA'));
  push('AUTOFILL_SCHEMA', schemas.includes('TASK_CREATION_AUTOFILL_SCHEMA'));
  push('VALIDATION_SCHEMA', schemas.includes('TASK_CREATION_VALIDATION_SCHEMA'));
  push('PAYLOAD_BUILDER', builder.includes('buildTaskCreationPayload'));
  push('NO_SILENT_MULTI_UNIT', catalog.includes('unitSelectionRequired: units.length > 1'));
  push('DIALOG_SECTIONS', dialog.includes('Nội dung việc') && dialog.includes('Phân loại'));
  push('AUTOFILL_COLLAPSED', dialog.includes('Hệ thống tự điền'));
  push('NO_ID_INPUT', !dialog.includes('name="ID"') && !dialog.includes('TASK_CODE'));
  push('UNIT_SELECT_WHEN_MULTI', dialog.includes('showUnitSelect') && dialog.includes('Đơn vị *'));
  push('TITLE_REQUIRED', validateTaskCreationInput({ ...DEFAULT_CREATE_FORM, title: '' }, multiUnitCatalog) !== null);
  push('UNIT_REQUIRED_MULTI', validateTaskCreationInput({ ...DEFAULT_CREATE_FORM, title: 'X', donViId: '' }, multiUnitCatalog) !== null);
  push('HOOK_USES_BUILDER', hook.includes('buildTaskCreationPayload'));
  push('GAS_STATUS_NEW', gasDb.includes("STATUS: 'NEW'"));
  push('GAS_TASK_CODE', gasDb.includes('taskDbMakeTaskCode_'));
  push('GAS_DON_VI', gasCreate.includes('donViId'));
  push('AUTHORITY', authority.includes('TASK_CREATION_AUTOFILL_SCHEMA'));
  push('ADR', adr.includes('PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Unit/task-type catalogs are pilot UI config until snapshot wiring');
  warnings.push('Browser create-flow smoke not run');

  return { suite: 'PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1', status, checks, warnings };
}
