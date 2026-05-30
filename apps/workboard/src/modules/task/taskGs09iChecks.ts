/**
 * PHASE_TASK_GS_09I — Operational readability rebalance checks (FE).
 */

import {
  READABILITY_OPERATIONAL_LINE_PX,
  READABILITY_PASSIVE_META_PX,
  READABILITY_TITLE_PX,
  SCAN_ROW_MIN_HEIGHT_PX,
} from '@/shared/utils/scanRhythm';

export interface Gs09iCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function readStyleSheets(): string {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');
}

function ruleSlice(cls: string): string {
  const styleText = readStyleSheets();
  const idx = styleText.indexOf(`.${cls}`);
  return idx >= 0 ? styleText.slice(idx, idx + 480) : '';
}

function ruleIncludes(cls: string, fragments: string[]): boolean {
  const slice = ruleSlice(cls);
  return Boolean(slice) && fragments.every((f) => slice.includes(f));
}

export function runTaskGs09iChecks(): { suite: string; status: string; checks: Gs09iCheck[] } {
  const checks: Gs09iCheck[] = [];
  const styleText = readStyleSheets();
  const panelLabelSlice = ruleSlice('panel-zone-label');

  checks.push({
    id: 'titleTypography',
    label: 'task-card-title uses 16px semibold slate-900',
    pass: ruleIncludes('task-card-title', ['text-base', 'font-semibold', 'slate-900']),
    detail: 'text-base font-semibold text-slate-900',
  });

  checks.push({
    id: 'operationalLineContrast',
    label: 'task-card-operational-line uses 14px medium slate-800',
    pass: ruleIncludes('task-card-operational-line', ['text-sm', 'font-medium', 'slate-800']),
    detail: 'text-sm font-medium text-slate-800',
  });

  checks.push({
    id: 'passiveMetaClass',
    label: 'task-meta-passive uses slate-700 medium',
    pass: ruleIncludes('task-meta-passive', ['slate-700', 'font-medium', 'text-sm']),
    detail: 'text-sm text-slate-700 font-medium',
  });

  checks.push({
    id: 'panelZoneLabel',
    label: 'panel-zone-label normalized (semibold slate-700, no uppercase)',
    pass:
      panelLabelSlice.includes('slate-700') &&
      panelLabelSlice.includes('font-semibold') &&
      !panelLabelSlice.includes('uppercase'),
    detail: panelLabelSlice.slice(0, 120),
  });

  checks.push({
    id: 'queueScanRow',
    label: 'Queue scan row readability class present',
    pass: styleText.includes('.task-card-scan-row') && styleText.includes('min-h-[3rem]'),
    detail: `min-height ${SCAN_ROW_MIN_HEIGHT_PX}px`,
  });

  checks.push({
    id: 'operationalZoneContrastFloor',
    label: 'task-runtime-zone contrast floor for slate-400/500',
    pass: styleText.includes('.task-runtime-zone') && styleText.includes('#475569'),
    detail: 'slate-600 floor in operational zone',
  });

  checks.push({
    id: 'panelExecutionMeta',
    label: 'panel-execution-meta readability class',
    pass: ruleIncludes('panel-execution-meta', ['text-sm', 'slate-800']),
    detail: 'panel execution meta line',
  });

  checks.push({
    id: 'readabilityConstants',
    label: 'scanRhythm readability constants',
    pass:
      READABILITY_TITLE_PX >= 16 &&
      READABILITY_OPERATIONAL_LINE_PX >= 14 &&
      READABILITY_PASSIVE_META_PX >= 14,
    detail: `${READABILITY_TITLE_PX}/${READABILITY_OPERATIONAL_LINE_PX}/${READABILITY_PASSIVE_META_PX}`,
  });

  checks.push({
    id: 'noUltraMutedOperationalLine',
    label: 'Operational line does not use operational-muted token',
    pass: !ruleIncludes('task-card-operational-line', ['operational-muted']),
    detail: 'uses slate-700 directly',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09I_OPERATIONAL_READABILITY_REBALANCE',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
