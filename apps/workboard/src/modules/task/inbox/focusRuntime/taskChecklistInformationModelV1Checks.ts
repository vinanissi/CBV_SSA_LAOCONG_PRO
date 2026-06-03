/**
 * PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1 — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runTaskChecklistInformationModelV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const schemas = readLocal('taskChecklistInformationModelSchemas.ts');
  const resolver = readLocal('resolveTaskChecklistFieldValues.ts');
  const header = readLocal('CompactTaskHeader.tsx');
  const panel = readLocal('OperatorDetailPanel.tsx');
  const section = readRepo(
    'apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx',
  );
  const runtime = readLocal('WorkInboxFocusRuntime.tsx');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/TASK_CHECKLIST_INFORMATION_MODEL_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_CHECKLIST_INFORMATION_MODEL_V1.md');

  push('TASK_DETAIL_SCHEMA', schemas.includes('TASK_DETAIL_SCHEMA'));
  push('OPERATOR_PANEL_SCHEMA', schemas.includes('OPERATOR_DETAIL_PANEL_SCHEMA'));
  push('CHECKLIST_ITEM_SCHEMA', schemas.includes('CHECKLIST_ITEM_SCHEMA'));
  push('FIELD_RESOLVER', resolver.includes('buildTaskChecklistFieldBag'));
  push('HEADER_SCHEMA_DRIVEN', header.includes('resolveTaskHeaderBlocks'));
  push('NO_TITLE_AS_DESCRIPTION', resolver.includes("field.key === 'task_description'"));
  push('DETAIL_NO_TIMELINE', !panel.includes('TIMELINE GẦN NHẤT'));
  push(
    'DETAIL_FRIENDLY_LABELS',
    schemas.includes("label: 'Công việc'") && schemas.includes("label: 'Phụ trách'"),
  );
  push('DANG_LAM_FOCUS', section.includes('ĐANG LÀM:'));
  push('FOCUS_GHI_CHU', section.includes('Ghi chú') && section.includes('handleFocusStepNote'));
  push('NO_CASE_IN_MODEL', !schemas.includes('CaseWorkspace') && !schemas.includes('caseKey'));
  push('AI_NOT_TITLE_FALLBACK', !runtime.includes('pendingAction?.trim() || runtimeTask?.title'));
  push('AUTHORITY_TASK_CHECKLIST', authority.includes('TASK → CHECKLIST'));
  push('ADR', adr.includes('PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('task_context / expected_result map to existing TaskDetail fields only');
  warnings.push('Browser smoke not run');

  return { suite: 'PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1', status, checks, warnings };
}
