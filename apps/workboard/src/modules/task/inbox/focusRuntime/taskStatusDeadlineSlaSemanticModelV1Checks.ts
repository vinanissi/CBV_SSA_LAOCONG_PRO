/**
 * PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1 — static checks.
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

export function runTaskStatusDeadlineSlaSemanticModelV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const schemas = readLocal('taskStatusDeadlineSlaSemanticModelSchemas.ts');
  const resolver = readLocal('resolveTaskStatusSemanticSummary.ts');
  const header = readLocal('CompactTaskHeader.tsx');
  const summaryUi = readLocal('TaskStatusSemanticSummary.tsx');
  const fieldBag = readLocal('resolveTaskChecklistFieldValues.ts');
  const panelSchema = readLocal('taskChecklistInformationModelSchemas.ts');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1.md');

  push('TASK_STATUS_SUMMARY_SCHEMA', schemas.includes('TASK_STATUS_SUMMARY_SCHEMA'));
  push('SEMANTIC_RESOLVER', resolver.includes('buildTaskSemanticSummaryBag'));
  push('WORKFLOW_STATUS_KEY', resolver.includes('workflow_status'));
  push('DEADLINE_STATE_KEY', resolver.includes('deadline_state'));
  push('NO_INBOX_CHIP_AS_WORKFLOW', !fieldBag.includes('WORK_INBOX_STATUS_CHIP[item.status]'));
  push('DEADLINE_INBOX_SPLIT', resolver.includes('DEADLINE_INBOX_STATUSES'));
  push('HEADER_SEMANTIC_UI', header.includes('TaskStatusSemanticSummary'));
  push('NO_MIXED_PILLS', !header.includes('work-inbox-compact-task-header__badges'));
  push('PANEL_WORKFLOW_SOURCE', panelSchema.includes("source: 'workflow_status'"));
  push('PANEL_DEADLINE_SOURCE', panelSchema.includes("source: 'deadline_state'"));
  push('LABELS_PRESENT', summaryUi.includes('semantic-summary__label'));
  push('AUTHORITY', authority.includes('workflow_state'));
  push('ADR', adr.includes('PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('InboxStatus today/overdue still used for deadline derivation only');
  warnings.push('Browser smoke not run');

  return { suite: 'PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1', status, checks, warnings };
}
