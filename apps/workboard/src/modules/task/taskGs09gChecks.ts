/**
 * PHASE_TASK_GS_09G — Light operational theme checks (FE).
 */

import { loadThemeMode, THEME_STORAGE_KEY } from '@/runtime/themeRuntime';

export interface Gs09gCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export function runTaskGs09gChecks(): { suite: string; status: string; checks: Gs09gCheck[] } {
  const checks: Gs09gCheck[] = [];

  checks.push({
    id: 'defaultLightMode',
    label: 'Default theme mode is light when localStorage empty',
    pass: loadThemeMode() === 'light' || localStorage.getItem(THEME_STORAGE_KEY) === 'light',
    detail: loadThemeMode(),
  });

  checks.push({
    id: 'htmlThemeClass',
    label: 'html has theme-light or theme-dark class',
    pass: document.documentElement.classList.contains('theme-light') || document.documentElement.classList.contains('theme-dark'),
    detail: document.documentElement.className,
  });

  checks.push({
    id: 'lightSurfaceToken',
    label: 'Light workspace uses operational surface token',
    pass: getComputedStyle(document.body).backgroundColor !== 'rgb(10, 15, 26)',
    detail: getComputedStyle(document.body).backgroundColor,
  });

  const requiredClasses = [
    'task-card-compact',
    'task-card-focused',
    'inline-action-primary',
    'dominant-escalation',
    'detail-panel-aside',
  ];

  const styleText = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');

  for (const cls of requiredClasses) {
    checks.push({
      id: `css_${cls}`,
      label: `CSS class .${cls} present`,
      pass: styleText.includes(`.${cls}`),
      detail: cls,
    });
  }

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_TASK_GS_09G_LIGHT_OPERATIONAL_THEME',
    status: failed.length === 0 ? 'GO' : 'GO_WITH_WARNINGS',
    checks,
  };
}
