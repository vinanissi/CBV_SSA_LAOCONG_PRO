/**
 * PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2 — CBV_TCS_V1 static checks.
 */

import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import workspaceSource from './focusRuntime/FocusTaskWorkspace.tsx?raw';
import tabsSource from './focusRuntime/RightContextTabs.tsx?raw';
import headerSource from './focusRuntime/FocusHeader.tsx?raw';
import badgesSource from './focusRuntime/QuickContextBadges.tsx?raw';
import actionSource from './focusRuntime/FocusActionBar.tsx?raw';
import feedbackSource from './focusRuntime/focusRuntimeFeedback.ts?raw';
import sidebarSource from '@/components/layout/OperatorMainSidebar.tsx?raw';
import appShellSource from '@/components/layout/AppShell.tsx?raw';
import panelSource from './WorkInboxGroupsPanel.tsx?raw';
import tasksSource from '@/modules/task/TasksPage.tsx?raw';
import transitionSource from './workInboxRuntimeTransition.ts?raw';

export interface FocusRuntimeImage2Check {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
  detail?: string;
}

export function runFocusRuntimePolishImage2Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: FocusRuntimeImage2Check[];
  warnings: string[];
} {
  const checks: FocusRuntimeImage2Check[] = [];
  const warnings: string[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: FocusRuntimeImage2Check['severity'] = pass ? 'OK' : 'ERROR',
    detail?: string,
  ) => {
    checks.push({ id, label, pass, severity, detail });
  };

  const noNestedSidebar =
    !runtimeSource.includes('CompactSidebar') && !panelSource.includes('CompactSidebar');

  push(
    'UI_IMAGE2_LAYOUT_3_REGION_RENDER',
    'Three-region layout (app sidebar + workspace + right tabs)',
    runtimeSource.includes('work-inbox-focus-runtime__body--two-col') &&
      sidebarSource.includes('operator-main-sidebar') &&
      tabsSource.includes('RightContextTabs'),
    'CRITICAL',
  );

  push('UI_NO_DUPLICATED_LEFT_PANEL', 'No nested left panel in focus main', noNestedSidebar, 'CRITICAL');

  push(
    'UI_NO_DUPLICATED_RIGHT_PANEL',
    'Global DetailPanel hidden on inbox V3',
    appShellSource.includes('suppressGlobalDetailPanel') &&
      appShellSource.includes('!suppressGlobalDetailPanel && <DetailPanel />'),
    'CRITICAL',
  );

  push(
    'UI_SINGLE_MAIN_SIDEBAR_ONLY',
    'Operator main sidebar is canonical',
    sidebarSource.includes('VẬN HÀNH') &&
      sidebarSource.includes('Việc của tôi') &&
      sidebarSource.includes('Thu gọn'),
  );

  push(
    'UI_RIGHT_CONTEXT_TABS_ONLY',
    'Right context tabs panel only',
    tabsSource.includes('work-inbox-right-context-tabs') &&
      tabsSource.includes('Chi tiết') &&
      tabsSource.includes('Gọi điện'),
  );

  push(
    'UI_FOCUS_HEADER_RENDER',
    'Focus header with FOCUS MODE label',
    headerSource.includes('FOCUS MODE') && headerSource.includes('Quay lại inbox'),
  );

  push(
    'UI_QUICK_CONTEXT_BADGES_RENDER',
    'Quick context badges',
    badgesSource.includes('work-inbox-quick-badges') && workspaceSource.includes('QuickContextBadges'),
  );

  push(
    'UI_ACTION_BAR_BUTTONS_BOUND',
    'Action bar primary bound',
    actionSource.includes('Bắt đầu xử lý') && panelSource.includes('onPrimary={handleOpenFocusItem}'),
  );

  push(
    'UI_SECONDARY_ACTION_SAFE_FALLBACK',
    'Secondary safe fallback',
    actionSource.includes('showFocusRuntimeFeedback') &&
      feedbackSource.includes('Chức năng đang chuẩn bị'),
  );

  push(
    'UI_PREV_NEXT_TASK_NAVIGATION',
    'Prev/next navigation',
    headerSource.includes('onPrev') && workspaceSource.includes('goNext'),
  );

  push(
    'UI_BACK_TO_INBOX',
    'Back to inbox',
    headerSource.includes('onBackToInbox') && panelSource.includes('goBackToInbox'),
  );

  push(
    'UI_BOTTOM_STATUS_BAR_RENDER',
    'Bottom status anchor',
    runtimeSource.includes('bottom-runtime-status-bar'),
  );

  push(
    'UI_1366x768_NO_MAJOR_OVERFLOW',
    'Two-column focus body without nested sidebar',
    runtimeSource.includes('work-inbox-focus-runtime__body--two-col') &&
      !runtimeSource.includes('CompactSidebar'),
  );

  push(
    'UI_LEGACY_HIDDEN_ON_INBOX',
    'Legacy runtime hidden on /inbox primary',
    transitionSource.includes('shouldRenderLegacyTaskRuntime') &&
      tasksSource.includes('renderLegacyRuntime'),
  );

  const anyFail = checks.some((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = anyFail
    ? 'FAIL'
    : warnings.length > 0
      ? 'GO_WITH_WARNINGS'
      : 'GO';

  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2',
    status,
    checks,
    warnings,
  };
}
