/**
 * PHASE_TASK_GS_09N — Bottom status bar polish checks (FE).
 */

import statusBarSource from '@/components/runtime/RuntimeStatusBar.tsx?raw';
import telemetrySource from '@/components/runtime/RuntimeTelemetryInline.tsx?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';

export interface BottomStatusBarPolishCheck {
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
  return idx >= 0 ? styleText.slice(idx, idx + 560) : '';
}

const FORBIDDEN_TELEMETRY = ['text-slate-400', 'text-slate-500', 'text-xs'];

export function runTaskBottomStatusBarPolishChecks(): {
  suite: string;
  status: string;
  checks: BottomStatusBarPolishCheck[];
} {
  const checks: BottomStatusBarPolishCheck[] = [];
  const barCss = ruleSlice('operational-status-bar');
  const metricsCss = ruleSlice('runtime-status-metrics');
  const telemetryZoneCss = ruleSlice('operational-status-zone-telemetry');

  checks.push({
    id: 'threeZoneLayout',
    label: 'Footer has 3 zones: actions / telemetry / session',
    pass:
      statusBarSource.includes('operational-status-zone-actions') &&
      statusBarSource.includes('operational-status-zone-telemetry') &&
      statusBarSource.includes('operational-status-zone-session') &&
      statusBarSource.includes('operational-status-zone-sep'),
    detail: 'LEFT · CENTER · RIGHT zoning',
  });

  checks.push({
    id: 'telemetryFontSize',
    label: 'Telemetry font >= 14px',
    pass: metricsCss.includes('15px') || metricsCss.includes('text-[15px]') || metricsCss.includes('14px'),
    detail: metricsCss.slice(0, 120),
  });

  checks.push({
    id: 'noMutedTelemetryText',
    label: 'No slate-400/500 or text-xs in footer telemetry CSS',
    pass: !FORBIDDEN_TELEMETRY.some((token) => telemetryZoneCss.includes(token) || metricsCss.includes(token)),
    detail: 'Operational contrast preserved',
  });

  checks.push({
    id: 'overdueEmphasis',
    label: 'Overdue metric uses red-700 + semibold',
    pass:
      ruleSlice('runtime-status-overdue').includes('red-700') &&
      ruleSlice('runtime-status-overdue').includes('font-semibold'),
    detail: 'Risk metric scan priority',
  });

  checks.push({
    id: 'warningEmphasis',
    label: 'Warning metric uses amber-700 + semibold',
    pass:
      ruleSlice('runtime-status-warning').includes('amber-700') &&
      ruleSlice('runtime-status-warning').includes('font-semibold'),
    detail: 'Warning metric scan priority',
  });

  checks.push({
    id: 'footerHeightControlled',
    label: 'Footer height within 42px–48px band',
    pass:
      barCss.includes('min-h-[42px]') &&
      (barCss.includes('max-h-[46px]') || barCss.includes('h-11')),
    detail: barCss.slice(0, 100),
  });

  checks.push({
    id: 'noContentOverlapPattern',
    label: 'Footer uses shrink-0 flex shell (no overlap with main)',
    pass: barCss.includes('shrink-0'),
    detail: 'AppShell flex column layout',
  });

  checks.push({
    id: 'noQueueTelemetryCard',
    label: 'Old telemetry card not in TasksPage main area',
    pass: !tasksPageSource.includes('RuntimeTelemetryStrip'),
    detail: 'GS_09M relocation preserved',
  });

  checks.push({
    id: 'reducedInlineSeparators',
    label: 'Telemetry zone uses spacing not per-metric separators',
    pass: !telemetrySource.includes('runtime-status-sep'),
    detail: 'Zone-level separators only',
  });

  checks.push({
    id: 'sessionRightZone',
    label: 'Session label in right zone, not mixed in telemetry',
    pass:
      statusBarSource.includes('runtime-status-session-label') &&
      !telemetrySource.includes('SESSION_LABEL'),
    detail: 'Session isolated RIGHT',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09N_BOTTOM_STATUS_BAR_POLISH',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
