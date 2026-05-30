/**
 * PHASE_TASK_GS_09L — System-wide operational visibility checks (FE).
 */

import {
  READABILITY_BASE_PX,
  READABILITY_MENU_PX,
  READABILITY_OPERATIONAL_LINE_PX,
  READABILITY_TITLE_PX,
} from '@/shared/utils/scanRhythm';

export interface VisibilityCheck {
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

const FORBIDDEN = ['slate-400', 'slate-500', 'gray-400', 'gray-500'];

export function runTaskOperationalVisibilityChecks(): {
  suite: string;
  status: string;
  checks: VisibilityCheck[];
} {
  const checks: VisibilityCheck[] = [];
  const styleText = readStyleSheets();

  checks.push({
    id: 'systemBaseFont',
    label: 'Operational runtime base font >= 16px',
    pass:
      styleText.includes('.operational-runtime') &&
      (ruleSlice('operational-runtime').includes('text-base') || styleText.includes('16px')),
    detail: `${READABILITY_BASE_PX}px target`,
  });

  checks.push({
    id: 'queueTitleSize',
    label: 'Queue card title >= 16px (text-base)',
    pass: ruleSlice('task-card-title').includes('text-base') && READABILITY_TITLE_PX >= 16,
    detail: `${READABILITY_TITLE_PX}px`,
  });

  checks.push({
    id: 'operationalLineSize',
    label: 'Operational line >= 14px (text-sm)',
    pass: ruleSlice('task-card-operational-line').includes('text-sm') && READABILITY_OPERATIONAL_LINE_PX >= 14,
    detail: `${READABILITY_OPERATIONAL_LINE_PX}px`,
  });

  checks.push({
    id: 'sidebarMenuReadable',
    label: 'Sidebar menu 15px medium with active semibold',
    pass:
      ruleSlice('sidebar-nav-link').includes('15px') &&
      ruleSlice('sidebar-nav-link').includes('font-medium') &&
      ruleSlice('sidebar-nav-link.active').includes('font-semibold'),
    detail: `${READABILITY_MENU_PX}px menu`,
  });

  checks.push({
    id: 'controlStripReadable',
    label: 'Control tabs text-sm slate-800/900',
    pass:
      ruleSlice('task-control-tab').includes('text-sm') &&
      ruleSlice('task-control-tab.active').includes('slate-900'),
    detail: 'task-control-tab',
  });

  checks.push({
    id: 'panelExecutionReadable',
    label: 'Panel next action text-lg + reference title text-xl',
    pass:
      ruleSlice('panel-next-action-primary').includes('text-lg') &&
      ruleSlice('panel-reference-title').includes('text-xl'),
    detail: 'execution gravity',
  });

  checks.push({
    id: 'buttonVisibility',
    label: 'Primary buttons blue-700 semibold with min height',
    pass: ruleSlice('btn-primary').includes('blue-700') && ruleSlice('btn').includes('min-h-'),
    detail: 'btn-primary',
  });

  checks.push({
    id: 'iconBaseline',
    label: 'Operational icon baseline 16px (text-base slots)',
    pass: ruleSlice('task-action-slot').includes('text-base') && ruleSlice('sidebar-nav-icon').includes('text-base'),
    detail: 'h-7 action slots',
  });

  checks.push({
    id: 'topbarOperational',
    label: 'Top bar operational visibility classes',
    pass: styleText.includes('.operational-topbar-brand') && ruleSlice('operational-topbar-brand').includes('slate-900'),
    detail: 'operational-topbar',
  });

  for (const cls of [
    'task-card-title',
    'task-card-operational-line',
    'task-meta-passive',
    'sidebar-nav-link',
    'task-control-tab',
    'panel-next-action-primary',
  ]) {
    const slice = ruleSlice(cls);
    const bad = FORBIDDEN.filter((t) => slice.includes(t));
    checks.push({
      id: `noMuted_${cls}`,
      label: `.${cls} free of slate-400/500`,
      pass: bad.length === 0,
      detail: bad.length ? bad.join(', ') : 'ok',
    });
  }

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09L_SYSTEM_WIDE_OPERATIONAL_VISIBILITY_HARDENING',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
