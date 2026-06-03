/**
 * PHASE_CHECKLIST_SYNC_STATUS_FOOTER_RUNTIME — static checks.
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

export function runChecklistSyncStatusFooterRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxChecklistSection.tsx');
  const footer = readRepo('apps/workboard/src/components/runtime/RuntimeStatusBar.tsx');
  const app = readRepo('apps/workboard/src/app/App.tsx');
  const ctx = readRepo('apps/workboard/src/runtime/ChecklistSyncFooterContext.tsx');
  const indicator = readLocal('ChecklistSyncFooterIndicator.tsx');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md');

  push('CENTER_NO_SYNC_BAR', !section.includes('<ChecklistSyncStatusBar'));
  push('PUBLISHER_WIRED', section.includes('useChecklistSyncFooterPublisher'));
  push('FOOTER_INDICATOR', footer.includes('ChecklistSyncFooterIndicator'));
  push('PROVIDER', app.includes('ChecklistSyncFooterProvider'));
  push('CONTEXT', ctx.includes('ChecklistSyncFooterPayload'));
  push('MANUAL_SYNC', section.includes('handleManualSync') && indicator.includes('onRefresh'));
  push('ERROR_VISIBLE', indicator.includes('conflictMessage') && indicator.includes('role="alert"'));
  push('SYNC_GUARD_KEPT', section.includes('checkWriteGuard'));
  push('AUTHORITY', authority.includes('Footer Runtime'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('SFR browser suite required');

  return { suite: 'PHASE_CHECKLIST_SYNC_STATUS_FOOTER_RUNTIME', status, checks, warnings };
}
