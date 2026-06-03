/**
 * PHASE_DOSSIER_01 — static dossier aggregate checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossierAggregate } from './buildDossierAggregate';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runDossierAggregateChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const right = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx');
  const panel = readRepo('apps/workboard/src/modules/task/inbox/dossier/DossierAggregatePanel.tsx');
  const builder = readRepo('apps/workboard/src/modules/task/inbox/dossier/buildDossierAggregate.ts');
  const center = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/FocusContentCards.tsx');

  push('RIGHT_DOSSIER_TAB', right.includes("id: 'dossier'") && right.includes('Hồ sơ'));
  push('DOSSIER_PANEL', right.includes('DossierAggregatePanel'));
  push('BUILD_AGGREGATE', builder.includes('buildDossierAggregate'));
  push('TASK_GROUP', builder.includes('Tài liệu cấp Task'));
  push('EMPTY_STATE', panel.includes('Chưa có hồ sơ liên quan'));
  push('READ_ONLY', !panel.includes('createAttachment') && !panel.includes('deleteAttachment'));
  push('CENTER_PREVIEW_FLAGGED', center.includes('isCenterRecentDocumentsVisible'));
  push('CENTER_HIDDEN_BY_DEFAULT', config.includes('centerRecentDocumentsVisible: false'));
  push('CONTRACT_DOC', readRepo('00_SYSTEM_BRAIN/DOSSIER/DOSSIER_AGGREGATE_VIEW_CONTRACT.md').includes('DossierAggregate'));

  const sample = buildDossierAggregate({
    taskId: 'T-1',
    checklistItems: [
      {
        checklistId: 'CL-1',
        taskId: 'T-1',
        title: 'Bước 1',
        status: 'open',
        sortOrder: 1,
        isDone: false,
      },
    ],
    taskAttachments: [],
    feedbackByItemId: { 'CL-1': [{ id: 'F1', checklistItemId: 'CL-1', message: 'Test', createdAt: '2026-01-01' }] },
    attachmentsByItemId: {},
    linksByItemId: {},
  });
  push('AGGREGATE_BUILDS', sample.aggregate.groups.length >= 1);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live dossier UI not smoke-tested in CI');

  return { suite: 'PHASE_DOSSIER_01_RIGHT_PANEL_AGGREGATE_VIEW', status, checks, warnings };
}
