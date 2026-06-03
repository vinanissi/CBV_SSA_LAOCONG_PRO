/**
 * PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1 — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatRelatedEntityDisplay, validateRelatedEntityInput } from './resolveTaskRelatedEntity';

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

export function runTaskRelatedEntityInputModelV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const schemas = readLocal('taskRelatedEntityInputSchemas.ts');
  const resolver = readLocal('resolveTaskRelatedEntity.ts');
  const builder = readLocal('buildTaskCreationPayload.ts');
  const dialog = readLocal('WorkInboxCreateTaskDialog.tsx');
  const fieldBag = readRepo(
    'apps/workboard/src/modules/task/inbox/focusRuntime/resolveTaskChecklistFieldValues.ts',
  );
  const headerSchema = readRepo(
    'apps/workboard/src/modules/task/inbox/focusRuntime/taskHeaderContextEnrichmentSchemas.ts',
  );
  const gasCreate = readGas('48_WorkInboxCreateTask.js');
  const gasDb = readGas('40_TaskDbService.js');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/TASK_RELATED_ENTITY_INPUT_MODEL_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_RELATED_ENTITY_INPUT_MODEL_V1.md');

  push('TYPE_CATALOG', schemas.includes('TASK_RELATED_ENTITY_TYPE_CATALOG'));
  push('INPUT_SCHEMA', schemas.includes('TASK_CREATION_RELATED_ENTITY_INPUT_SCHEMA'));
  push('PHONE_TYPE', schemas.includes("key: 'PHONE'"));
  push('PLATE_TYPE', schemas.includes("key: 'LICENSE_PLATE'"));
  push('NO_STANDALONE_SDT', !dialog.includes('SĐT liên quan'));
  push('NO_STANDALONE_PLATE', !dialog.includes('>Biển số<') && !dialog.includes('<span>Biển số</span>'));
  push('RELATED_SECTION', dialog.includes('Đối tượng liên quan'));
  push('TYPE_VALUE_PAIR', dialog.includes('Loại đối tượng') && dialog.includes('Giá trị'));
  push('PAYLOAD_MAP', builder.includes('relatedEntityType') && builder.includes('relatedEntityId'));
  push('VALIDATION_PAIR', validateRelatedEntityInput('PHONE', '') !== null && validateRelatedEntityInput('', 'x') !== null);
  push('DISPLAY_FORMAT', formatRelatedEntityDisplay('PHONE', '0909123456') === 'SĐT: 0909123456');
  push('HEADER_DISPLAY', headerSchema.includes('task_related_entity_display'));
  push('FIELD_BAG', fieldBag.includes('task_related_entity_display'));
  push('GAS_RELATED_MAP', gasCreate.includes('wiOpResolveRelatedEntityFromPayload_'));
  push('GAS_DB_COLUMNS', gasDb.includes('RELATED_ENTITY_TYPE') && gasDb.includes('RELATED_ENTITY_ID'));
  push('AUTHORITY', authority.includes('RELATED_ENTITY_TYPE'));
  push('ADR', adr.includes('PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Legacy description [SĐT:/Biển số:] parsed for display only');
  warnings.push('Browser create smoke not run');

  return { suite: 'PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1', status, checks, warnings };
}
