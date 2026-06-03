/**
 * PHASE_DOSSIER_04 — static cross-focus checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildDossierFocusRequestFromItem,
  canDossierItemRequestChecklistFocus,
  checklistItemDomId,
  requestDossierCrossFocus,
  validateDossierFocusRequest,
} from './dossierCrossFocusNavigation';
import type { DossierItem } from './dossierAggregateTypes';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

const checklistItem: DossierItem = {
  id: 'a1',
  type: 'attachment',
  title: 'GPLX.jpg',
  source: 'checklist_attachment',
  taskId: 'T-1',
  checklistItemId: 'CL-1',
};

const taskLevelItem: DossierItem = {
  id: 't1',
  type: 'attachment',
  title: 'Bien ban.xlsx',
  source: 'task_attachment',
  taskId: 'T-1',
};

export function runDossierCrossFocusChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const panel = readRepo('apps/workboard/src/modules/task/inbox/dossier/DossierAggregatePanel.tsx');
  const nav = readRepo('apps/workboard/src/modules/task/inbox/dossier/dossierCrossFocusNavigation.ts');
  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
  const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
  const contract = readRepo('00_SYSTEM_BRAIN/DOSSIER/DOSSIER_CROSS_FOCUS_NAVIGATION_CONTRACT.md');

  push('GOTO_STEP_UI', panel.includes('Đi tới bước'));
  push('FOCUS_BUS', readRepo('apps/workboard/src/modules/task/inbox/dossier/dossierCrossFocusBus.ts').includes('publishDossierCrossFocus'));
  push('SCROLL_DOM_ID', nav.includes('cbv-checklist-item-') && row.includes('checklistDomId'));
  push('HIGHLIGHT_CLASS', row.includes('cross-focus') && section.includes('highlightedItemId'));
  push('LISTENER_WIRED', section.includes('useChecklistCrossFocusListener'));
  push('EXPAND_ON_FOCUS', nav.includes('expand: true') && section.includes('setItemExpanded'));
  push('TASK_LEVEL_SAFE', !canDossierItemRequestChecklistFocus(taskLevelItem));
  push('CHECKLIST_FOCUS_OK', canDossierItemRequestChecklistFocus(checklistItem));

  const req = buildDossierFocusRequestFromItem(checklistItem, 'T-1');
  const valid = validateDossierFocusRequest(req, ['CL-1']);
  push('VALIDATE_GO', valid.ok && valid.status === 'GO');

  const stale = validateDossierFocusRequest(req, []);
  push('STALE_WARNING', stale.status === 'GO_WITH_WARNINGS' && stale.warnings.includes('stale_checklist_item_id'));

  const taskVal = validateDossierFocusRequest(
    { ...req, checklistItemId: null },
    ['CL-1'],
  );
  push('TASK_LEVEL_MESSAGE', taskVal.warnings.includes('task_level_evidence'));

  push('DOM_ID_FN', checklistItemDomId('CL-1') === 'cbv-checklist-item-CL-1');
  push('NO_SHEET_WRITE', !nav.includes('api.') && !panel.includes('setItems'));
  push('CONTRACT_DOC', contract.includes('DossierFocusRequest'));
  push('CENTER_STILL_HIDDEN', readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/FocusContentCards.tsx').includes('isCenterRecentDocumentsVisible'));

  const publishResult = requestDossierCrossFocus(req, ['CL-1']);
  push('REQUEST_PUBLISH', publishResult.focused === true);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live cross-focus scroll not smoke-tested in CI');

  return { suite: 'PHASE_DOSSIER_04_CROSS_FOCUS_NAVIGATION', status, checks, warnings };
}
