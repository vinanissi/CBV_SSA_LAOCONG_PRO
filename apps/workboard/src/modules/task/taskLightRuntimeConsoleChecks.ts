/**
 * PHASE_TASK_GS_09P — Light industrial runtime console checks (FE).
 */

import statusBarSource from '@/components/runtime/RuntimeStatusBar.tsx?raw';
import drawerSource from '@/components/runtime/RuntimeFooterDrawer.tsx?raw';
import indexCssSource from '@/styles/index.css?raw';
import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';

export interface LightRuntimeConsoleCheck {
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

function ruleSlice(cls: string, source = readStyleSheets()): string {
  const idx = source.indexOf(`.${cls}`);
  return idx >= 0 ? source.slice(idx, idx + 720) : '';
}

const FORBIDDEN_CONSOLE = ['text-slate-400', 'text-slate-500'];
const FORBIDDEN_DARK_BG = ['bg-slate-900', 'bg-slate-950'];

function footerConsoleCss(): string {
  const live = readStyleSheets();
  const staticSrc = indexCssSource;
  return live.includes('runtime-light-console') ? live : staticSrc;
}

export function runTaskLightRuntimeConsoleChecks(): {
  suite: string;
  status: string;
  checks: LightRuntimeConsoleCheck[];
} {
  const checks: LightRuntimeConsoleCheck[] = [];
  const css = footerConsoleCss();
  const railCss = ruleSlice('runtime-light-console', css);
  const drawerCss = ruleSlice('runtime-footer-drawer', css);
  const footerBlock = css.slice(
    css.indexOf('runtime-light-console'),
    css.indexOf('runtime-light-console') + 4000,
  );

  checks.push({
    id: 'noDarkFooterRail',
    label: 'No dark footer rail (slate-900/950)',
    pass:
      statusBarSource.includes('runtime-light-console') &&
      !railCss.includes('bg-slate-900') &&
      !railCss.includes('bg-slate-950') &&
      !FORBIDDEN_DARK_BG.some((t) => railCss.includes(t)),
    detail: 'Light industrial footer',
  });

  checks.push({
    id: 'noDarkDrawer',
    label: 'Runtime drawer uses light surface',
    pass:
      drawerCss.includes('bg-slate-50') &&
      !drawerCss.includes('bg-slate-900') &&
      footerBlock.includes('runtime-footer-drawer-section-card'),
    detail: 'white/slate-50 drawer',
  });

  checks.push({
    id: 'lightIndustrialFooter',
    label: 'Footer light industrial style (slate-100 + slate-300 border)',
    pass: railCss.includes('bg-slate-100') && railCss.includes('border-slate-300'),
    detail: railCss.slice(0, 100),
  });

  checks.push({
    id: 'telemetryTextContrast',
    label: 'Footer telemetry uses slate-900/800/700',
    pass:
      footerBlock.includes('text-slate-900') &&
      footerBlock.includes('text-slate-800') &&
      footerBlock.includes('text-slate-700'),
    detail: 'Long-hour readability',
  });

  checks.push({
    id: 'noMutedConsoleText',
    label: 'No slate-400/500 in footer/drawer runtime console CSS block',
    pass: !FORBIDDEN_CONSOLE.some((t) => footerBlock.includes(t)),
    detail: 'Contrast floor',
  });

  checks.push({
    id: 'connectedGreen700',
    label: 'Connected uses green-700',
    pass: footerBlock.includes('text-green-700') && footerBlock.includes('bg-green-600'),
    detail: 'Live connection metric',
  });

  checks.push({
    id: 'overdueRed700',
    label: 'Overdue uses red-700',
    pass: footerBlock.includes('text-red-700') && footerBlock.includes('bg-red-50'),
    detail: 'Strongest risk metric',
  });

  checks.push({
    id: 'warningAmber700',
    label: 'Warning uses amber-700',
    pass: footerBlock.includes('text-amber-700'),
    detail: 'Operational warning',
  });

  checks.push({
    id: 'workerBlue700',
    label: 'Worker uses blue-700',
    pass: footerBlock.includes('text-blue-700'),
    detail: 'Worker runtime metric',
  });

  checks.push({
    id: 'runtimeClock',
    label: 'Runtime sync clock still wired',
    pass:
      statusBarSource.includes('runtime-console-clock') &&
      statusBarSource.includes('formatRuntimeSyncLabel'),
    detail: 'Sync HH:mm:ss',
  });

  checks.push({
    id: 'keyboardHints',
    label: 'Keyboard hints still present',
    pass: statusBarSource.includes('runtime-console-shortcuts') && statusBarSource.includes('J/K'),
    detail: 'Operator hints xl+',
  });

  checks.push({
    id: 'drawerExpands',
    label: 'Runtime drawer scaffold still wired',
    pass:
      statusBarSource.includes('RuntimeFooterDrawer') &&
      drawerSource.includes('runtime-footer-drawer'),
    detail: 'Slide-up console preserved',
  });

  checks.push({
    id: 'footerHeight',
    label: 'Footer height controlled (42–46px)',
    pass: railCss.includes('min-h-[42px]') && railCss.includes('max-h-[46px]'),
    detail: 'Compact rail',
  });

  checks.push({
    id: 'noQueueOverlap',
    label: 'Footer shrink-0 — no main overlap',
    pass: railCss.includes('shrink-0'),
    detail: 'Flex column shell',
  });

  checks.push({
    id: 'noQueueTelemetryCard',
    label: 'Queue area free of legacy telemetry card',
    pass: !tasksPageSource.includes('RuntimeTelemetryStrip'),
    detail: 'GS_09M preserved',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09P_LIGHT_RUNTIME_CONSOLE',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
