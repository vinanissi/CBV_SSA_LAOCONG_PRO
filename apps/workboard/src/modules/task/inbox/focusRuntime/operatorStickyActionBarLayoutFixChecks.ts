/**
 * PHASE_OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX — static layout/layer checks.
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

export function runOperatorStickyActionBarLayoutFixChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const actionBar = readLocal('FocusActionBar.tsx');
  const css = readRepo('apps/workboard/src/styles/index.css');
  const authority = readRepo('00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md');

  push('DROP_UP_CLASS', actionBar.includes('work-inbox-more-menu--drop-up'));
  push(
    'STICKY_GATED',
    actionBar.includes('work-inbox-more-menu--drop-up') &&
      actionBar.includes('data-cbv-more-menu-placement'),
  );
  push('PLACEMENT_ATTR', actionBar.includes('data-cbv-more-menu-placement'));
  push('DROP_UP_CSS', css.includes('.work-inbox-more-menu--drop-up'));
  push('LAYER_TOKENS', css.includes('--cbv-layer-dropdown'));
  push('FOOTER_Z', css.includes('--cbv-layer-footer'));
  push('STICKY_OVERFLOW', css.includes('work-inbox-focus-action-bar--sticky-bottom') && css.includes('overflow-visible'));
  push('MENU_Z', css.includes('z-[var(--cbv-layer-dropdown'));
  push('ANCHOR_CLASS', actionBar.includes('work-inbox-focus-action-bar__more-menu-anchor'));
  push('AUTHORITY_RULE', authority.includes('must not obscure') && authority.includes('dropdown'));
  push('HANDLERS_INTACT', actionBar.includes('onMoreMenuOpen') && actionBar.includes('MORE_ACTIONS'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live dropdown overlap requires browser SAB suite');

  return { suite: 'PHASE_OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX', status, checks, warnings };
}
