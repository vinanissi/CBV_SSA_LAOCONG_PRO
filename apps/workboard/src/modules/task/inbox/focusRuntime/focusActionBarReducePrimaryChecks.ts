/**
 * PHASE_UI_ACTION_BAR_REDUCE_PRIMARY_ACTIONS — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isReducedPrimaryActionBarEnabled } from './focusActionBarReducedPrimaryConfig';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runFocusActionBarReducePrimaryChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const actionBar = readLocal('FocusActionBar.tsx');
  const workspace = readLocal('FocusTaskWorkspace.tsx');
  const config = readLocal('focusActionBarReducedPrimaryConfig.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_REDUCED_PRIMARY_CONTRACT.md');

  push('REDUCED_DEFAULT_ON', isReducedPrimaryActionBarEnabled());
  push('CONFIG_FN', config.includes('isReducedPrimaryActionBarEnabled'));
  push('REDUCED_CSS', readRepo('apps/workboard/src/styles/index.css').includes('--reduced-primary'));
  push('NO_DOMINANT_PRIMARY', actionBar.includes('showPrimaryInBar'));
  push('OPEN_IN_MORE', actionBar.includes('showOpenDetailInMore'));
  push('RIGHT_PANEL_SIGNAL', workspace.includes('rightPanelDetailVisible'));
  push('PAUSE_KEPT', actionBar.includes('Tạm dừng'));
  push('TRANSFER_KEPT', actionBar.includes('Chuyển giao'));
  push('COMPLETE_KEPT', actionBar.includes('Hoàn thành'));
  push('MORE_KEPT', actionBar.includes('Thao tác khác'));
  push('HANDLERS', actionBar.includes('onPrimary') && actionBar.includes('onPause'));
  push('NOT_DUPLICATED', (workspace.match(/<FocusActionBar/g) ?? []).length === 1);
  push('CONTRACT_DOC', contract.includes('reducedPrimaryActionsEnabled: true'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live reduced action bar not smoke-tested in CI');

  return { suite: 'PHASE_UI_ACTION_BAR_REDUCE_PRIMARY_ACTIONS', status, checks, warnings };
}
