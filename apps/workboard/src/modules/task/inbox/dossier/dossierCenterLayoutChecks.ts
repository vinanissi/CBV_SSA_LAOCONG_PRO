/**
 * PHASE_DOSSIER_02 — static center/right layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOSSIER_CENTER_RIGHT_LAYOUT } from './dossierCenterLayoutConfig';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runDossierCenterLayoutChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const center = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/FocusContentCards.tsx');
  const right = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx');
  const config = readRepo('apps/workboard/src/modules/task/inbox/dossier/dossierCenterLayoutConfig.ts');
  const dialogHost = readRepo('apps/workboard/src/modules/task/inbox/attachments/WorkInboxTaskAttachmentDialogHost.tsx');
  const checklist = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistAttachmentPanel.tsx');
  const actionBar = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/FocusActionBar.tsx');

  push('LAYOUT_CONTRACT', config.includes('centerRecentDocumentsVisible: false'));
  push('CENTER_DEFAULT_HIDDEN', center.includes('isCenterRecentDocumentsVisible'));
  push('CENTER_NO_DEFAULT_PREVIEW', !center.includes('variant="preview"') || center.includes('showCenterAttachments'));
  push('CENTER_HINT', center.includes('tab') && center.includes('Hồ sơ'));
  push('RIGHT_DOSSIER_TAB', right.includes("id: 'dossier'") && right.includes('DossierAggregatePanel'));
  push('DIALOG_HOST', dialogHost.includes('WorkInboxAddAttachmentDialog'));
  push('CHECKLIST_UPLOAD', checklist.includes('Tải tệp lên'));
  push('TASK_ATTACH_ACTION', actionBar.includes('ACTION_MORE_ATTACH'));
  push('NO_CENTER_ARIA_RECENT', !center.match(/aria-label="Tài liệu gần đây"/) || center.includes('showCenterAttachments'));
  push('CONTRACT_DOC', readRepo('00_SYSTEM_BRAIN/DOSSIER/DOSSIER_CENTER_RIGHT_LAYOUT_CONTRACT.md').includes('centerRecentDocumentsVisible'));

  push('LAYOUT_MODEL', DOSSIER_CENTER_RIGHT_LAYOUT.centerPanelRole === 'checklist_work_surface');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live layout smoke test not run in CI');
  warnings.push('Rollback: localStorage cbv-dossier-center-attachments-preview:v1=true');

  return { suite: 'PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER', status, checks, warnings };
}
