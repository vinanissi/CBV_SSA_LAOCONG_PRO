/**
 * PHASE_OCMS_03D_CASE_CONTEXT_STRIP_ENRICHMENT — static enrichment checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskItem } from '@/api/contracts';
import { buildCaseContextStripView } from './buildCaseContextStripView';
import { deriveCaseReadModel } from './deriveCaseReadModel';
import { resolveStripVisibilityLevel } from './resolveStripVisibility';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function sampleTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    taskId: 'TK_20260414_B4465281',
    title: 'Đề xuất chi hoa hồng bán áo cho nhân sự',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: 'u1',
    ownerId: 'u1',
    ownerDisplayName: 'Trang Trần',
    dueDate: '',
    href: '/inbox/TK_20260414_B4465281',
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
    ...overrides,
  };
}

export function runOcmsCaseContextStripEnrichmentChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED — enrichment is FE projection only'];
  const skipped: string[] = ['Live browser screenshot — operator verify in Focus Mode'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const strip = readLocal('WorkInboxCaseContextStrip.tsx');
  const labels = readLocal('ocmsStripLabels.ts');

  push('ENRICH_STRIP_SECTIONS', strip.includes('Responsible:') && strip.includes('Discovery:') && strip.includes('Diagnostics:'));
  push('ENRICH_VISIBILITY_LABEL', strip.includes('Visibility:') && strip.includes('data-ocms-visibility'));
  push('ENRICH_CASE_HEADER', strip.includes('work-inbox-case-context-strip__section-label') && strip.includes('CASE'));
  push('ENRICH_SAFE_KEY', strip.includes('safeKeyLabel') && !strip.includes('model.caseKey'));
  push('ENRICH_RICH_RELATIONS', labels.includes('formatRichRelationsSummary') && labels.includes('việc'));
  push('ENRICH_DIAGNOSTICS_OK', labels.includes("return 'OK'"));

  const model = deriveCaseReadModel({ task: sampleTask() });
  const view = model ? buildCaseContextStripView(model, resolveStripVisibilityLevel(model)) : null;

  push('ENRICH_NO_CANONICAL_KEY', !view?.safeKeyLabel?.includes('OPERATIONS:'));
  push('ENRICH_VIEW_HAS_TYPE', Boolean(view?.caseTypeLabel));
  push('ENRICH_VIEW_HAS_LIFECYCLE', Boolean(view?.lifecycleLabel));
  push('ENRICH_VIEW_HAS_RESPONSIBLE', view?.responsibleDisplay === 'Trang Trần');
  push('ENRICH_VIEW_HAS_DISCOVERY', Boolean(view?.discoveryLine?.includes('TASK_ANCHORED')));
  push('ENRICH_VIEW_HAS_SAFE_KEY', view?.safeKeyLabel === 'TASK:TK_20260414_B4465281');
  push('ENRICH_VIEW_HAS_RELATIONS', Boolean(view?.relationsSummary?.includes('việc')));
  push('ENRICH_VIEW_HAS_DIAGNOSTICS', view?.diagnosticsStatus === 'OK');
  push('ENRICH_VIEW_HAS_VISIBILITY', Boolean(view?.visibilityLabel));

  const hoSo = deriveCaseReadModel({
    task: sampleTask({ relatedHoSoId: 'HS-001', title: 'Hồ sơ gia nhập' }),
  });
  const hoSoView = hoSo ? buildCaseContextStripView(hoSo, resolveStripVisibilityLevel(hoSo)) : null;
  push('ENRICH_HO_SO_KEY', hoSoView?.safeKeyLabel === 'HO_SO:HS-001');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return { suite: 'PHASE_OCMS_03D_CASE_CONTEXT_STRIP_ENRICHMENT', status, checks, warnings, skipped };
}
