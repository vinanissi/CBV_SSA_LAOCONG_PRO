/**
 * PHASE_DOSSIER_03 — static filter/grouping checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyDossierFilterGrouping } from './applyDossierFilterGrouping';
import type { DossierAggregate } from './dossierAggregateTypes';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

const sampleAggregate: DossierAggregate = {
  taskId: 'T-1',
  counts: {
    taskAttachments: 1,
    checklistAttachments: 1,
    checklistLinks: 1,
    checklistFeedback: 1,
    totalDossierItems: 4,
  },
  groups: [
    {
      id: 'cl-1',
      type: 'checklist_item',
      title: 'Bước 1',
      checklistItemId: 'CL-1',
      items: [
        {
          id: 'a1',
          type: 'attachment',
          title: 'GPLX.jpg',
          source: 'checklist_attachment',
          taskId: 'T-1',
          checklistItemId: 'CL-1',
        },
        {
          id: 'l1',
          type: 'link',
          title: 'Sheet',
          url: 'https://example.com',
          source: 'checklist_link',
          taskId: 'T-1',
          checklistItemId: 'CL-1',
        },
        {
          id: 'f1',
          type: 'feedback',
          title: 'Hẹn bổ sung',
          source: 'checklist_feedback',
          taskId: 'T-1',
          checklistItemId: 'CL-1',
        },
      ],
    },
    {
      id: 'task-level',
      type: 'task_level',
      title: 'Tài liệu cấp Task',
      items: [
        {
          id: 't1',
          type: 'attachment',
          title: 'Bien ban.xlsx',
          source: 'task_attachment',
          taskId: 'T-1',
        },
      ],
    },
  ],
};

export function runDossierFilterGroupingChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const panel = readRepo('apps/workboard/src/modules/task/inbox/dossier/DossierAggregatePanel.tsx');
  const apply = readRepo('apps/workboard/src/modules/task/inbox/dossier/applyDossierFilterGrouping.ts');
  const center = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/FocusContentCards.tsx');

  push('FILTER_UI_ALL', apply.includes("'Tất cả'"));
  push('FILTER_UI_ATTACH', apply.includes("'Tài liệu'"));
  push('FILTER_UI_LINKS', apply.includes("'Liên kết'"));
  push('FILTER_UI_FEEDBACK', apply.includes("'Phản hồi'"));
  push('FILTER_COUNTS', panel.includes('work-inbox-dossier__filter-count'));
  push('GROUPING_MODES', panel.includes('by_checklist_item') && apply.includes('task_level'));
  push('APPLY_FN', apply.includes('applyDossierFilterGrouping'));
  push('EMPTY_ATTACH', apply.includes('Chưa có tài liệu'));
  push('EMPTY_LINK', apply.includes('Chưa có liên kết'));
  push('EMPTY_FEEDBACK', apply.includes('Chưa có phản hồi'));
  push('READ_ONLY', !panel.includes('setItems') && !panel.includes('delete'));
  push('CENTER_STILL_HIDDEN', center.includes('isCenterRecentDocumentsVisible'));
  push('CONTRACT_DOC', readRepo('00_SYSTEM_BRAIN/DOSSIER/DOSSIER_FILTER_GROUPING_CONTRACT.md').includes('DossierFilteredAggregate'));

  const linkOnly = applyDossierFilterGrouping(sampleAggregate, 'links', 'by_checklist_item');
  push('FILTER_LINKS_WORKS', linkOnly.groups.reduce((n, g) => n + g.items.length, 0) === 1);

  const attachOnly = applyDossierFilterGrouping(sampleAggregate, 'attachments', 'by_checklist_item');
  push('FILTER_ATTACH_WORKS', attachOnly.counts.attachments === 2 && attachOnly.groups.length >= 1);

  const ungrouped = applyDossierFilterGrouping(sampleAggregate, 'all', 'ungrouped');
  push('UNGROUPED_MODE', ungrouped.groups.length === 1 && ungrouped.groups[0].items.length === 4);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live filter UI not smoke-tested in CI');

  return { suite: 'PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING', status, checks, warnings };
}
