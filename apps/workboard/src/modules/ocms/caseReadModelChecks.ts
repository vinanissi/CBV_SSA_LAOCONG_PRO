/**
 * PHASE_CASE_REFACTOR_02_CASE_READ_MODEL — static checks.
 * Run: npx tsx -e "import { runCaseReadModelChecks } from './src/modules/ocms/caseReadModelChecks.ts'; console.log(runCaseReadModelChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskItem } from '@/api/contracts';
import { getCaseReadModelForTask } from './getCaseReadModelForTask';
import type { TaskOperationalBundle } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function task(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 'T-RM-01',
    title: 'Kiểm tra read model',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: 'u1',
    ownerId: 'u1',
    ownerDisplayName: 'Nguyễn A',
    dueDate: '',
    href: '/inbox/T-RM-01',
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
    ...overrides,
  };
}

const sampleBundle: TaskOperationalBundle = {
  taskId: 'T-RM-01',
  timeline: [
    {
      timelineId: 'tl-1',
      taskId: 'T-RM-01',
      eventType: 'TASK_UPDATED',
      eventLabel: 'Cập nhật tiến độ',
      actor: 'u1',
      payload: '',
      createdAt: '2026-06-01T10:00:00Z',
      source: 'TASK_TIMELINE',
    },
  ],
  appointments: [],
  notes: [
    {
      noteId: 'n-1',
      taskId: 'T-RM-01',
      content: 'Ghi chú vận hành',
      author: 'u1',
      createdAt: '2026-06-01T09:00:00Z',
    },
  ],
  documents: [
    {
      documentId: 'd-1',
      taskId: 'T-RM-01',
      title: 'Biên bản.pdf',
      url: 'https://example.com/doc',
      uploadedBy: 'u1',
      uploadedAt: '2026-06-01T08:00:00Z',
    },
  ],
  audits: [],
};

export function runCaseReadModelChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const deriverSrc = readLocal('deriveCaseRuntimeReadModel.ts');
  const projectionSrc = readLocal('caseReadModelProjection.ts');
  const apiSrc = readLocal('getCaseReadModelForTask.ts');

  push('RM_NO_CASE_MAIN', !deriverSrc.includes('CASE_MAIN') && !projectionSrc.includes('CASE_MAIN'));
  push(
    'RM_NO_WRITE_API',
    !deriverSrc.includes('fetch(') &&
      !deriverSrc.includes('createCase') &&
      !apiSrc.includes('CaseRepository') &&
      !apiSrc.includes('CaseService'),
  );
  push('RM_EXPORT_GET_CASE', apiSrc.includes('getCaseReadModelForTask'));
  push('RM_OCMSCORE_PRESERVED', deriverSrc.includes('ocmsCore'));

  const model = getCaseReadModelForTask({
    task: task(),
    operationalBundle: sampleBundle,
    checklistItems: [
      {
        checklistId: 'c-1',
        taskId: 'T-RM-01',
        title: 'Bước 1',
        status: 'open',
        sortOrder: 1,
        isDone: false,
        isRequired: true,
      },
    ],
  });

  push('RM_DERIVE_NON_NULL', model != null);
  push('RM_HAS_CASE_KEY', Boolean(model?.caseKey));
  push('RM_DISPLAY_KEY_NOT_CANONICAL', model?.displayKey !== model?.caseKey);
  push('RM_CHECKLIST_PROJECTED', (model?.checklist.length ?? 0) === 1);
  push('RM_DOCUMENT_PROJECTED', (model?.documents.length ?? 0) === 1);
  push('RM_TIMELINE_INCLUDES_COMMENT', model?.timeline.some((e) => e.entryType === 'COMMENT') ?? false);
  push('RM_TASK_REF_SINGLE', model?.tasks.length === 1);
  push('RM_OCMSCORE_STRIP_COMPAT', model?.ocmsCore.caseKey === model?.caseKey);
  push(
    'RM_DIAGNOSTICS_EXPLICIT',
    (model?.diagnostics.codes.length ?? 0) > 0 && model?.diagnostics.codes.every((c) => c.code && c.severity),
  );
  push('RM_MULTI_TASK_DEFERRED', model?.diagnostics.codes.some((c) => c.code === 'MULTI_TASK_GROUPING_DEFERRED') ?? false);

  const noPerm = getCaseReadModelForTask({ task: task({ permissionAllowed: false }) });
  push('RM_PERMISSION_NULL', noPerm === null);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    suite: 'PHASE_CASE_REFACTOR_02_CASE_READ_MODEL',
    status,
    checks,
    warnings,
  };
}
