/**
 * PHASE_TASK_GS_09R — Remove header shortcut hints checks (FE).
 */

import tasksPageSource from '@/modules/task/TasksPage.tsx?raw';
import statusBarSource from '@/components/runtime/RuntimeStatusBar.tsx?raw';

export interface RemoveHeaderShortcutCheck {
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

export function runTaskRemoveHeaderShortcutChecks(): {
  suite: string;
  status: string;
  checks: RemoveHeaderShortcutCheck[];
} {
  const checks: RemoveHeaderShortcutCheck[] = [];
  const styleText = readStyleSheets();

  checks.push({
    id: 'shortcutRowRemoved',
    label: 'Keyboard shortcut hint row removed from TasksPage header',
    pass:
      !tasksPageSource.includes('J/K · Enter · R · ESC') &&
      !tasksPageSource.includes('J/K · Enter'),
    detail: 'No fixed shortcut line under title',
  });

  checks.push({
    id: 'compactTitleClass',
    label: 'Workspace title uses compact header class',
    pass:
      tasksPageSource.includes('task-workspace-title') &&
      styleText.includes('.task-workspace-title'),
    detail: 'Tight title spacing',
  });

  checks.push({
    id: 'titleStillPresent',
    label: 'Việc vận hành title preserved',
    pass: tasksPageSource.includes('Việc vận hành') && tasksPageSource.includes('<h1'),
    detail: 'Execution page identity',
  });

  checks.push({
    id: 'alertStripUnderHeader',
    label: 'Operational alert strip remains directly under title',
    pass:
      tasksPageSource.includes('task-workspace-title') &&
      tasksPageSource.includes('OperationalAlertHeader') &&
      tasksPageSource.indexOf('OperationalAlertHeader') > tasksPageSource.indexOf('task-workspace-title'),
    detail: 'Header → alert → queue hierarchy',
  });

  checks.push({
    id: 'footerShortcutsUnaffected',
    label: 'Footer runtime console shortcuts preserved',
    pass:
      statusBarSource.includes('runtime-console-shortcuts') &&
      statusBarSource.includes('J/K queue'),
    detail: 'Hints moved to footer only',
  });

  checks.push({
    id: 'keyboardSupportIntact',
    label: 'TasksPage keyboard handler comment/logic still present',
    pass: tasksPageSource.includes('Keyboard: J/K') || tasksPageSource.includes('useEffect'),
    detail: 'Support removed from UI only, not behavior',
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_TASK_GS_09R_REMOVE_HEADER_SHORTCUT_HINTS',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
