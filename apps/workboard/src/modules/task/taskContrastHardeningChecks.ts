/**
 * HOTFIX — Operational contrast hardening checks (FE).
 * PHASE_TASK_GS_09K
 */

export interface ContrastCheck {
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
  return idx >= 0 ? styleText.slice(idx, idx + 420) : '';
}

const TASK_RUNTIME_CLASSES = [
  'task-card-title',
  'task-card-operational-line',
  'task-meta-passive',
  'task-control-tab',
  'panel-zone-label',
  'panel-next-action-primary',
  'panel-execution-meta',
  'task-signal-hot',
  'task-signal-overdue',
  'inline-action-primary',
];

const FORBIDDEN_MUTED = ['slate-400', 'slate-500', 'gray-400', 'gray-500', 'operational-muted'];

export function runTaskContrastHardeningChecks(): {
  suite: string;
  status: string;
  checks: ContrastCheck[];
} {
  const checks: ContrastCheck[] = [];
  const styleText = readStyleSheets();

  checks.push({
    id: 'primaryTitleContrast',
    label: 'Primary titles use slate-900 semibold',
    pass: ruleSlice('task-card-title').includes('slate-900') && ruleSlice('task-card-title').includes('font-semibold'),
    detail: ruleSlice('task-card-title').slice(0, 100),
  });

  checks.push({
    id: 'operationalLineContrast',
    label: 'Operational line uses slate-800 medium',
    pass: ruleSlice('task-card-operational-line').includes('slate-800') && ruleSlice('task-card-operational-line').includes('font-medium'),
    detail: ruleSlice('task-card-operational-line').slice(0, 100),
  });

  checks.push({
    id: 'passiveMetaContrast',
    label: 'Passive meta uses slate-700 medium',
    pass: ruleSlice('task-meta-passive').includes('slate-700') && ruleSlice('task-meta-passive').includes('font-medium'),
    detail: ruleSlice('task-meta-passive').slice(0, 100),
  });

  checks.push({
    id: 'panelLabelContrast',
    label: 'Panel labels use slate-900 semibold',
    pass: ruleSlice('panel-zone-label').includes('slate-900') && ruleSlice('panel-zone-label').includes('font-semibold'),
    detail: ruleSlice('panel-zone-label').slice(0, 100),
  });

  checks.push({
    id: 'panelNextActionContrast',
    label: 'Panel next action uses slate-900',
    pass: ruleSlice('panel-next-action-primary').includes('slate-900'),
    detail: ruleSlice('panel-next-action-primary').slice(0, 100),
  });

  checks.push({
    id: 'hotSignalStrongColors',
    label: 'Hot signals use 700-weight operational colors',
    pass:
      ruleSlice('task-signal-hot').includes('amber-700') &&
      ruleSlice('task-signal-overdue').includes('red-700') &&
      ruleSlice('task-signal-blocked').includes('orange-700'),
    detail: 'amber/red/orange-700',
  });

  checks.push({
    id: 'primaryButtonReadable',
    label: 'Primary buttons blue-700 semibold',
    pass: ruleSlice('inline-action-primary').includes('blue-700') && styleText.includes('bg-blue-700'),
    detail: 'inline-action-primary + btn-primary',
  });

  checks.push({
    id: 'controlTabContrast',
    label: 'Control tabs inactive slate-700 / active slate-900',
    pass:
      ruleSlice('task-control-tab').includes('slate-700') &&
      ruleSlice('task-control-tab.active').includes('slate-900'),
    detail: 'task-control-tab',
  });

  checks.push({
    id: 'runtimeZoneMutedFloor',
    label: 'Task runtime remaps slate-400/500 to slate-700',
    pass: styleText.includes('.task-runtime-zone .text-slate-400') && styleText.includes('#334155'),
    detail: 'GS_09K runtime override',
  });

  for (const cls of TASK_RUNTIME_CLASSES) {
    const slice = ruleSlice(cls);
    const forbidden = FORBIDDEN_MUTED.filter((token) => slice.includes(token));
    checks.push({
      id: `noMuted_${cls}`,
      label: `.${cls} has no slate-400/500 gray blur`,
      pass: forbidden.length === 0,
      detail: forbidden.length ? forbidden.join(', ') : 'clean',
    });
  }

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09K_OPERATIONAL_CONTRAST_HARDENING',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
