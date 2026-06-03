/**
 * PHASE_OCMS_03E_OPERATOR_CONTEXT_UX_POLISH — static UX polish checks.
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

function sampleTask(): TaskItem {
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
  };
}

export function runOcmsCaseContextStripUxPolishChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED — UX polish is FE-only'];
  const skipped: string[] = ['Live 2–3s operator scan — manual Focus Mode verify'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const strip = readLocal('WorkInboxCaseContextStrip.tsx');
  const css = readFileSync(join(__dir, '..', '..', 'styles', 'index.css'), 'utf8');

  push('UX03E_COMPACT_CONTEXT_LINE', strip.includes('work-inbox-case-context-strip__context-line'));
  push('UX03E_NO_ROW_DUMP', !strip.includes('StripRow') && !strip.includes('label="Visibility:"'));
  push('UX03E_RESPONSIBLE_PILL', strip.includes('👤') && strip.includes('responsibleDisplay'));
  push('UX03E_RELATIONS_ACTION', strip.includes('relationsActionLabel') && strip.includes('🔗'));
  push('UX03E_DISCOVERY_HUMAN', strip.includes('discoverySourceLabel') && strip.includes('📍'));
  push('UX03E_DIAGNOSTICS_CALM', strip.includes('pill--ok') && strip.includes('✓'));
  push('UX03E_DIAGNOSTICS_WARN', strip.includes('pill--warn') && strip.includes('⚠'));
  push('UX03E_VISIBILITY_ATTR_ONLY', strip.includes('data-ocms-visibility') && !strip.includes('Visibility:'));
  push('UX03E_MINIMAL_HEIGHT', css.includes('work-inbox-case-context-strip--minimal') && css.includes('2.75rem'));
  push('UX03E_STANDARD_HEIGHT', css.includes('work-inbox-case-context-strip--standard'));

  const model = deriveCaseReadModel({ task: sampleTask() });
  const stdLevel = model ? resolveStripVisibilityLevel(model) : 'STANDARD';
  const stdView = model ? buildCaseContextStripView(model, stdLevel === 'MINIMAL' ? 'STANDARD' : stdLevel) : null;
  const minView = model ? buildCaseContextStripView(model, 'MINIMAL') : null;

  push('UX03E_STD_HAS_CONTEXT', Boolean(stdView?.responsibleDisplay && stdView.relationsActionLabel));
  push('UX03E_STD_NO_VISIBLE_KEY', !stdView?.safeKeyLabel);
  push('UX03E_MINIMAL_COMPACT', Boolean(minView?.level === 'MINIMAL' && !minView.responsibleDisplay && !minView.caseTitle));
  push('UX03E_RELATIONS_OPERATOR_TEXT', stdView?.relationsActionLabel?.includes('liên quan') ?? false);
  push('UX03E_NO_RAW_KEY_DOM', !strip.includes('model.caseKey'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return { suite: 'PHASE_OCMS_03E_OPERATOR_CONTEXT_UX_POLISH', status, checks, warnings, skipped };
}
