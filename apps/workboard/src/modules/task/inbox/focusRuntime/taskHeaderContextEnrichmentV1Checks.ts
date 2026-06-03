/**
 * PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1 — static checks.
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

export function runTaskHeaderContextEnrichmentV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const schema = readLocal('taskHeaderContextEnrichmentSchemas.ts');
  const resolver = readLocal('resolveTaskHeaderContext.ts');
  const contextUi = readLocal('TaskHeaderContextBlock.tsx');
  const header = readLocal('CompactTaskHeader.tsx');
  const fieldBag = readLocal('resolveTaskChecklistFieldValues.ts');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/TASK_HEADER_CONTEXT_ENRICHMENT_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_HEADER_CONTEXT_ENRICHMENT_V1.md');

  push('TASK_HEADER_CONTEXT_SCHEMA', schema.includes('TASK_HEADER_CONTEXT_SCHEMA'));
  push('CONTEXT_RESOLVER', resolver.includes('resolveTaskHeaderContextRows'));
  push('LABEL_MO_TA', schema.includes("label: 'MÔ TẢ'"));
  push('LABEL_THONG_TIN', schema.includes("label: 'THÔNG TIN THÊM'"));
  push('LABEL_KET_QUA', schema.includes("label: 'KẾT QUẢ CẦN ĐẠT'"));
  push('LABEL_AI', schema.includes("label: 'TÓM TẮT AI'"));
  push('CONTEXT_BLOCK_UI', header.includes('TaskHeaderContextBlock'));
  push('SEMANTIC_AFTER_CONTEXT', header.indexOf('TaskHeaderContextBlock') < header.indexOf('TaskStatusSemanticSummary'));
  push('NO_DUPLICATE_AI_BLOCK', !header.includes('work-inbox-compact-task-header__ai'));
  push('NO_TITLE_IN_CONTEXT', !fieldBag.includes('item.summary?.trim()'));
  push('DEDUPE_GUARD', resolver.includes('shouldSkipDuplicateValue'));
  push('SEMANTIC_PRESERVED', header.includes('TaskStatusSemanticSummary'));
  push('AUTHORITY', authority.includes('TASK_HEADER_CONTEXT_SCHEMA'));
  push('ADR', adr.includes('PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('task_description/context map to existing TaskDetail fields only');
  warnings.push('Browser smoke not run');

  return { suite: 'PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1', status, checks, warnings };
}
