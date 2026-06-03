/**
 * PHASE_DOSSIER_05 — static dossier actions checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildDossierActionsForItem,
  buildDriveFileUrl,
  resolveDossierOpenUrl,
  safeHttpUrl,
} from './dossierActions';
import type { DossierItem } from './dossierAggregateTypes';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

const withUrl: DossierItem = {
  id: 'a1',
  type: 'attachment',
  title: 'GPLX.jpg',
  url: 'https://example.com/gplx.jpg',
  source: 'checklist_attachment',
  taskId: 'T-1',
  checklistItemId: 'CL-1',
};

const noUrl: DossierItem = {
  id: 'f1',
  type: 'feedback',
  title: 'Hẹn bổ sung',
  source: 'checklist_feedback',
  taskId: 'T-1',
  checklistItemId: 'CL-1',
};

const taskItem: DossierItem = {
  id: 't1',
  type: 'attachment',
  title: 'Bien ban.xlsx',
  source: 'task_attachment',
  taskId: 'T-1',
};

export function runDossierActionsChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const panel = readRepo('apps/workboard/src/modules/task/inbox/dossier/DossierAggregatePanel.tsx');
  const actions = readRepo('apps/workboard/src/modules/task/inbox/dossier/dossierActions.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/DOSSIER/DOSSIER_ACTIONS_CONTRACT.md');

  push('ACTION_UI_MO', actions.includes("'Mở'"));
  push('ACTION_UI_COPY', actions.includes('Copy link'));
  push('ACTION_UI_FOCUS', actions.includes('Đi tới bước'));
  push('ACTION_UI_CONTEXT', actions.includes('Xem ngữ cảnh'));
  push('ITEM_ACTIONS_COMPONENT', panel.includes('DossierItemActions'));
  push('OPEN_ENABLED_URL', buildDossierActionsForItem(withUrl).some((a) => a.type === 'open_item' && a.enabled));
  push('OPEN_DISABLED_NO_URL', !buildDossierActionsForItem(noUrl).some((a) => a.type === 'open_item' && a.enabled));
  push('COPY_ENABLED_URL', buildDossierActionsForItem(withUrl).some((a) => a.type === 'copy_link' && a.enabled));
  push('FOCUS_DELEGATES', actions.includes('onFocusChecklistItem'));
  push('FEEDBACK_CONTEXT', buildDossierActionsForItem(noUrl).some((a) => a.type === 'view_source_context'));
  push('TASK_LEVEL_NO_FOCUS', !buildDossierActionsForItem(taskItem).some((a) => a.type === 'focus_checklist_item'));
  push('DRIVE_URL_BUILDER', buildDriveFileUrl('abc123')?.includes('drive.google.com'));
  push('SAFE_HTTP', safeHttpUrl('https://x.com') === 'https://x.com');
  push('NO_DELETE', !actions.includes('delete') && !panel.includes('Xóa'));
  push('NO_SHEET_WRITE', !actions.includes('api.write') && !actions.includes('setItems'));
  push('CONTRACT_DOC', contract.includes('DossierAction'));
  push('CLIPBOARD_HANDLING', actions.includes('clipboard_unavailable'));
  push('RESOLVE_OPEN_URL', resolveDossierOpenUrl(withUrl) === 'https://example.com/gplx.jpg');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live dossier action UI not smoke-tested in CI');

  return { suite: 'PHASE_DOSSIER_05_DOSSIER_ACTIONS', status, checks, warnings };
}
