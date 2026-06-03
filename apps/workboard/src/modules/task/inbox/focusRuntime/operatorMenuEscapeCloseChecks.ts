/**
 * PHASE_OPERATOR_MENU_ESCAPE_CLOSE — static menu dismiss checks.
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

export function runOperatorMenuEscapeCloseChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const actionBar = readLocal('FocusActionBar.tsx');
  const hook = readLocal('useWorkInboxMoreMenuDismiss.ts');
  const host = readRepo('apps/workboard/src/modules/task/inbox/actionRuntime/WorkInboxFocusActionHost.tsx');
  const runtime = readRepo('apps/workboard/src/modules/task/inbox/actionRuntime/useWorkInboxActionRuntime.ts');
  const authority = readRepo('00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md');

  push('DISMISS_HOOK', hook.includes('useWorkInboxMoreMenuDismiss'));
  push('ESC_HANDLER', hook.includes("e.key !== 'Escape'") && hook.includes('keydown'));
  push('CLICK_OUTSIDE', hook.includes('pointerdown'));
  push('FOCUS_RETURN', hook.includes('anchorRef.current?.focus'));
  push('DIALOG_GUARD', hook.includes('work-inbox-dialog-backdrop'));
  push('LISTENER_CLEANUP', hook.includes('removeEventListener'));
  push('ACTION_BAR_WIRED', actionBar.includes('useWorkInboxMoreMenuDismiss') && actionBar.includes('onMoreMenuClose'));
  push('MENU_ATTR', actionBar.includes('data-cbv-more-menu="true"'));
  push('HOST_CLOSE', host.includes('onMoreMenuClose'));
  push('ITEM_CLOSE_RUNTIME', runtime.includes('setMoreMenuOpen(false)'));
  push('DROP_UP_PRESERVED', actionBar.includes('work-inbox-more-menu--drop-up'));
  push('AUTHORITY_ESC', authority.includes('ESC') || authority.includes('Escape'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('MEC browser suite required for GO');

  return { suite: 'PHASE_OPERATOR_MENU_ESCAPE_CLOSE', status, checks, warnings };
}
