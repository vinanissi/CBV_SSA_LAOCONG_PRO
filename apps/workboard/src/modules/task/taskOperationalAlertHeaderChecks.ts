/**
 * PHASE_TASK_GS_09Q — Operational alert header unification checks (FE).
 */

import focusStripSource from '@/components/ui/FocusStrip.tsx?raw';
import headerSource from '@/components/ui/OperationalAlertHeader.tsx?raw';
import stripSource from '@/components/ui/OperationalAlertStrip.tsx?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import { buildOperationalAlertSummary } from '@/shared/utils/operationalAlertSummary';

export interface OperationalAlertHeaderCheck {
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

export function runTaskOperationalAlertHeaderChecks(): {
  suite: string;
  status: string;
  checks: OperationalAlertHeaderCheck[];
} {
  const checks: OperationalAlertHeaderCheck[] = [];
  const styleText = readStyleSheets();

  const withRisk = buildOperationalAlertSummary({
    overdueCount: 1,
    missingGplxCount: 1,
    pendingConfirmCount: 1,
    unassignedCount: 0,
  });

  const allClear = buildOperationalAlertSummary({
    overdueCount: 0,
    missingGplxCount: 0,
    pendingConfirmCount: 0,
    unassignedCount: 0,
  });

  checks.push({
    id: 'noFragmentedPillsOnTasks',
    label: 'FocusStrip hidden on work-inbox routes (no separate pill row)',
    pass: focusStripSource.includes('isWorkInboxRoute') && focusStripSource.includes('return null'),
    detail: 'Unified header replaces pill row',
  });

  checks.push({
    id: 'unifiedStripExists',
    label: 'Unified operational alert strip component exists',
    pass:
      stripSource.includes('OperationalAlertStrip') &&
      stripSource.includes('operational-alert-strip') &&
      headerSource.includes('OperationalAlertHeader'),
    detail: 'Single summary strip',
  });

  checks.push({
    id: 'riskSummarySentence',
    label: 'Risk alerts summarized into one sentence',
    pass:
      withRisk.riskCount === 3 &&
      withRisk.summaryText.includes('3 vấn đề vận hành') &&
      withRisk.summaryText.includes('quá hạn') &&
      withRisk.summaryText.includes('GPLX thiếu'),
    detail: withRisk.summaryText,
  });

  checks.push({
    id: 'passiveNotInRiskSummary',
    label: 'Passive unassigned does not inflate risk summary',
    pass:
      allClear.allClear &&
      allClear.riskCount === 0 &&
      !allClear.summaryText.includes('chưa phân công') &&
      withRisk.summaryText.includes('vấn đề vận hành') &&
      !withRisk.summaryText.includes('chưa phân công'),
    detail: 'Passive only in detail expand',
  });

  checks.push({
    id: 'createButtonRightHeader',
    label: '+ Tạo việc on right side of alert header row',
    pass:
      headerSource.includes('operational-header-primary-action') &&
      headerSource.includes('+ Tạo việc') &&
      tasksPageSource.includes('OperationalAlertHeader'),
    detail: 'Stable execution anchor',
  });

  checks.push({
    id: 'createNotInStrip',
    label: '+ Tạo việc not inside alert strip',
    pass: !stripSource.includes('Tạo việc') && !stripSource.includes('onCreate'),
    detail: 'Semantic separation',
  });

  checks.push({
    id: 'detailExpandAffordance',
    label: 'Alert strip supports detail expand',
    pass:
      stripSource.includes('operational-alert-detail-link') &&
      stripSource.includes('operational-alert-detail-list'),
    detail: 'Inline expand/collapse',
  });

  checks.push({
    id: 'compactLayout',
    label: 'Alert header layout compact',
    pass:
      styleText.includes('.operational-alert-header') &&
      styleText.includes('.operational-alert-strip') &&
      styleText.includes('py-2'),
    detail: 'Single compact row',
  });

  checks.push({
    id: 'tasksPageNoInlineCreate',
    label: 'TasksPage title row no longer embeds create button',
    pass:
      tasksPageSource.includes('OperationalAlertHeader onCreate={openCreate}') &&
      !tasksPageSource.includes('btn-primary shrink-0 !px-2 !py-1 text-xs'),
    detail: 'Create moved to alert header',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09Q_OPERATIONAL_ALERT_HEADER',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
