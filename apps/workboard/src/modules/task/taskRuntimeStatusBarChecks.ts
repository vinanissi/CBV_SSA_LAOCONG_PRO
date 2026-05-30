/**
 * PHASE_TASK_GS_09M — Runtime status bar relocation checks (FE).
 */

import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import appShellSource from '@/components/layout/AppShell.tsx?raw';
import appSource from '@/app/App.tsx?raw';

export interface RuntimeStatusBarCheck {
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
  return idx >= 0 ? styleText.slice(idx, idx + 520) : '';
}

export function runTaskRuntimeStatusBarChecks(): {
  suite: string;
  status: string;
  checks: RuntimeStatusBarCheck[];
} {
  const checks: RuntimeStatusBarCheck[] = [];
  const styleText = readStyleSheets();

  checks.push({
    id: 'oldTelemetryCardRemoved',
    label: 'RuntimeTelemetryStrip removed from TasksPage',
    pass: !tasksPageSource.includes('RuntimeTelemetryStrip'),
    detail: 'TasksPage must not render queue-area telemetry card',
  });

  checks.push({
    id: 'telemetryPublisherWired',
    label: 'TasksPage publishes telemetry to context',
    pass:
      tasksPageSource.includes('useTaskRuntimeTelemetryPublisher') &&
      tasksPageSource.includes('publishRuntimeTelemetry'),
    detail: 'Context bridge for bottom status bar',
  });

  checks.push({
    id: 'statusBarInAppShell',
    label: 'RuntimeStatusBar mounted in AppShell footer',
    pass:
      appShellSource.includes('RuntimeStatusBar') &&
      !appShellSource.includes('QuickActionBar') &&
      !appShellSource.includes('TopRuntimeStrip'),
    detail: 'Fixed bottom operational status bar',
  });

  checks.push({
    id: 'statusBarFixedBottom',
    label: 'Status bar CSS — compact fixed footer shell',
    pass:
      styleText.includes('.operational-status-bar') &&
      ruleSlice('operational-status-bar').includes('shrink-0') &&
      ruleSlice('operational-status-bar').includes('border-t'),
    detail: '40–52px compact bar with top border',
  });

  checks.push({
    id: 'telemetryInlineStyles',
    label: 'Inline telemetry metric colors defined',
    pass: ['runtime-status-connected', 'runtime-status-overdue', 'runtime-status-warning', 'runtime-status-worker'].every(
      (cls) => styleText.includes(`.${cls}`),
    ),
    detail: 'green/red/amber/blue operational contrast',
  });

  checks.push({
    id: 'quickActionsPreserved',
    label: 'Quick operational actions remain in status bar',
    pass: styleText.includes('.operational-status-actions') && styleText.includes('.operational-status-action'),
    detail: '+ Việc · + Hồ sơ · Upload · Search · SLA',
  });

  checks.push({
    id: 'noYellowAlertBlock',
    label: 'No runtime-telemetry-warning card in queue CSS path',
    pass: !tasksPageSource.includes('runtime-telemetry-strip'),
    detail: 'Queue area free of giant telemetry card',
  });

  checks.push({
    id: 'telemetryContextProvider',
    label: 'TaskRuntimeTelemetryProvider wraps app shell',
    pass:
      appSource.includes('TaskRuntimeTelemetryProvider') &&
      appSource.includes('<AppShell'),
    detail: 'Context bridges TasksPage → RuntimeStatusBar',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09M_RUNTIME_STATUS_BAR',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
