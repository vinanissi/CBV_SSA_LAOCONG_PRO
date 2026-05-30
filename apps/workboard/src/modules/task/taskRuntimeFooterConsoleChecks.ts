/**
 * PHASE_TASK_GS_09O — Runtime footer console checks (FE).
 */

import statusBarSource from '@/components/runtime/RuntimeStatusBar.tsx?raw';
import telemetrySource from '@/components/runtime/RuntimeTelemetryInline.tsx?raw';
import drawerSource from '@/components/runtime/RuntimeFooterDrawer.tsx?raw';
import clockSource from '@/shared/utils/runtimeClock.ts?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';

export interface RuntimeFooterConsoleCheck {
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
  return idx >= 0 ? styleText.slice(idx, idx + 640) : '';
}

const FLASHY_ANIMATIONS = ['animate-pulse', 'animate-bounce', 'animate-ping'];

export function runTaskRuntimeFooterConsoleChecks(): {
  suite: string;
  status: string;
  checks: RuntimeFooterConsoleCheck[];
} {
  const checks: RuntimeFooterConsoleCheck[] = [];
  const styleText = readStyleSheets();
  const railCss = ruleSlice('runtime-light-console');
  const pulseCss = styleText.includes('@keyframes runtime-connected-pulse')
    ? styleText.slice(
        styleText.indexOf('@keyframes runtime-connected-pulse'),
        styleText.indexOf('@keyframes runtime-connected-pulse') + 280,
      )
    : '';

  checks.push({
    id: 'footerRailExists',
    label: 'Runtime footer light console class present',
    pass:
      statusBarSource.includes('runtime-light-console') &&
      railCss.includes('bg-slate-100') &&
      !railCss.includes('bg-slate-900'),
    detail: 'GS_09P — industrial light rail',
  });

  checks.push({
    id: 'telemetryReadable',
    label: 'Runtime telemetry font >= 14px on console rail',
    pass: ruleSlice('runtime-status-metrics').includes('15px') || ruleSlice('runtime-status-metrics').includes('14px'),
    detail: ruleSlice('runtime-status-metrics').slice(0, 80),
  });

  checks.push({
    id: 'pulseSubtleOnly',
    label: 'Connected pulse uses slow opacity only (no Tailwind flash)',
    pass:
      styleText.includes('runtime-dot-live') &&
      pulseCss.includes('opacity') &&
      !pulseCss.includes('scale') &&
      !FLASHY_ANIMATIONS.some((a) => pulseCss.includes(a)),
    detail: '3.2s ease-in-out opacity',
  });

  checks.push({
    id: 'runtimeClockRenders',
    label: 'Runtime sync clock utility + UI wired',
    pass:
      clockSource.includes('formatRuntimeSyncLabel') &&
      statusBarSource.includes('runtime-console-clock') &&
      statusBarSource.includes('formatRuntimeSyncLabel'),
    detail: 'Sync HH:mm:ss in RIGHT zone',
  });

  checks.push({
    id: 'keyboardHintsSafe',
    label: 'Keyboard hints compact and non-tutorial',
    pass:
      statusBarSource.includes('runtime-console-shortcuts') &&
      statusBarSource.includes('J/K') &&
      !statusBarSource.includes('Tutorial'),
    detail: 'Subtle operator hints',
  });

  checks.push({
    id: 'drawerScaffold',
    label: 'Runtime footer drawer scaffold exists',
    pass:
      drawerSource.includes('RuntimeFooterDrawer') &&
      drawerSource.includes('TODO(GS_09O+)') &&
      statusBarSource.includes('RuntimeFooterDrawer'),
    detail: 'Slide-up console with TODO placeholders',
  });

  checks.push({
    id: 'footerHeightControlled',
    label: 'Footer height within 42px–46px band',
    pass: railCss.includes('min-h-[42px]') && railCss.includes('max-h-[46px]'),
    detail: railCss.slice(0, 90),
  });

  checks.push({
    id: 'noQueueOverlap',
    label: 'Footer shrink-0 flex shell (no main overlap)',
    pass: railCss.includes('shrink-0'),
    detail: 'AppShell column layout',
  });

  checks.push({
    id: 'noFlashyAnimation',
    label: 'No bounce/ping/glow animation classes in telemetry',
    pass:
      !telemetrySource.includes('animate-bounce') &&
      !telemetrySource.includes('animate-ping') &&
      !telemetrySource.includes('shadow-glow'),
    detail: 'Machine-grade calm motion',
  });

  checks.push({
    id: 'noQueueTelemetryCard',
    label: 'Queue area free of legacy telemetry card',
    pass: !tasksPageSource.includes('RuntimeTelemetryStrip'),
    detail: 'GS_09M preserved',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09O_RUNTIME_FOOTER_CONSOLE',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
