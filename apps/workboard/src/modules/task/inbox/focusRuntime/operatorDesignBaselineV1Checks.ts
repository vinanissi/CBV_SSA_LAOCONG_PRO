/**
 * PHASE_OPERATOR_DESIGN_BASELINE_V1 — static checks.
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

export function runOperatorDesignBaselineV1Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const baselineCss = readRepo('apps/workboard/src/styles/operator-design-baseline-v1.css');
  const theme = readRepo('apps/workboard/src/runtime/themeRuntime.ts');
  const main = readRepo('apps/workboard/src/main.tsx');
  const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
  const panel = readLocal('OperatorDetailPanel.tsx');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/OPERATOR_DESIGN_BASELINE_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_OPERATOR_DESIGN_BASELINE_V1.md');

  push('BASELINE_CSS', baselineCss.includes('--op-font-checklist-title'));
  push('BASELINE_CLASS', theme.includes('operator-design-baseline-v1'));
  push('CSS_IMPORTED', main.includes('operator-design-baseline-v1.css'));
  push('TASK_TITLE_TOKEN', baselineCss.includes('--op-font-task-title'));
  push('RIGHT_BODY_MIN', baselineCss.includes('--op-font-right-body'));
  push('COMPACT_COUNTERS', row.includes('work-inbox-smart-checklist__compact-counters'));
  push('DENSITY_PRESERVED', row.includes('densityMode') && row.includes('showInlineControls'));
  push('PANEL_ORDER', panel.indexOf('THAO TÁC NGHIỆP VỤ') < panel.indexOf('LIÊN HỆ / HỖ TRỢ'));
  push('TECH_COLLAPSED', panel.includes('<details') && panel.includes('Thông tin kỹ thuật'));
  push('AUTHORITY', authority.includes('Golden Reference'));
  push('ADR', adr.includes('PHASE_OPERATOR_DESIGN_BASELINE_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Browser smoke checklist not automated in this run');

  return { suite: 'PHASE_OPERATOR_DESIGN_BASELINE_V1', status, checks, warnings };
}
