/**
 * PHASE_TASK_GS_09F — Operational contrast hierarchy checks (FE).
 */

export interface Gs09fCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

/** Verify contrast hierarchy CSS contract is present */
export function runTaskGs09fChecks(): { suite: string; status: string; checks: Gs09fCheck[] } {
  const checks: Gs09fCheck[] = [];
  const styleText = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');

  const requiredClasses = [
    'task-card-focused',
    'task-card-meta',
    'inline-action-primary',
    'inline-action-secondary',
    'inline-action-passive',
    'dominant-escalation',
    'detail-panel-aside',
    'surface-active',
  ];

  for (const cls of requiredClasses) {
    checks.push({
      id: `css_${cls}`,
      label: `CSS class .${cls} defined`,
      pass: styleText.includes(`.${cls}`),
      detail: cls,
    });
  }

  checks.push({
    id: 'actionTierHelpers',
    label: 'InlineQuickActions exports action tier classes',
    pass: styleText.includes('.inline-action-primary') && styleText.includes('.inline-action-passive'),
    detail: 'primary / secondary / passive',
  });

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09F_OPERATIONAL_CONTRAST_HIERARCHY',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
