/**
 * PHASE_UI_ACTION_BAR_STICKY_BOTTOM — static layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isStickyBottomActionBarEnabled } from './focusActionBarLayoutConfig';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runFocusActionBarStickyBottomChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const workspace = readLocal('FocusTaskWorkspace.tsx');
  const actionBar = readLocal('FocusActionBar.tsx');
  const config = readLocal('focusActionBarLayoutConfig.ts');
  const header = readLocal('FocusHeader.tsx');
  const contract = readRepo('00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_CONTRACT.md');

  push('STICKY_DEFAULT_ON', isStickyBottomActionBarEnabled());
  push('CONFIG_FN', config.includes('isStickyBottomActionBarEnabled'));
  push('WORKSPACE_GATED', workspace.includes('isStickyBottomActionBarEnabled'));
  push('STICKY_CSS', readRepo('apps/workboard/src/styles/index.css').includes('work-inbox-focus-action-bar--sticky-bottom'));
  push('SCROLL_PADDING', readRepo('apps/workboard/src/styles/index.css').includes('work-inbox-focus-workspace__scroll-body'));
  push('NOT_DUPLICATED', (workspace.match(/<FocusActionBar/g) ?? []).length === 1);
  push('HANDLERS_WIRED', workspace.includes('onPrimary') && workspace.includes('onPause'));
  push('OPEN_DETAIL', actionBar.includes('onPrimary'));
  push('PAUSE', actionBar.includes('onPause'));
  push('TRANSFER', actionBar.includes('onForward'));
  push('COMPLETE', actionBar.includes('onComplete'));
  push('MORE', actionBar.includes('onMoreMenuOpen'));
  push('HEADER_NAV', header.includes('Sau ›') && header.includes('WorkInboxJumpToPosition'));
  push('NO_DELETE', !workspace.includes('deleteTask'));
  push('CONTRACT_DOC', contract.includes('stickyBottomEnabled: true'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live sticky action bar not smoke-tested in CI');

  return { suite: 'PHASE_UI_ACTION_BAR_STICKY_BOTTOM', status, checks, warnings };
}
