/**
 * PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN — CBV_TCS_V1 static checks.
 */

import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import workspaceSource from './focusRuntime/FocusTaskWorkspace.tsx?raw';
import tabsSource from './focusRuntime/RightContextTabs.tsx?raw';
import actionSource from './focusRuntime/FocusActionBar.tsx?raw';
import feedbackSource from './focusRuntime/focusRuntimeFeedback.ts?raw';
import panelSource from './WorkInboxGroupsPanel.tsx?raw';
import cardSource from './components/WorkInboxTaskCardV3.tsx?raw';
import kpiSource from './components/WorkInboxKpiStrip.tsx?raw';
import shellSource from '@/components/inbox/WorkInboxShell.tsx?raw';
import featureSource from './workInboxGroupsFeature.ts?raw';
import sidebarSource from '@/components/layout/OperatorMainSidebar.tsx?raw';
import { clampFocusIndex, mapTaskCardModelsToFocusItems } from './focusModeModels';
import type { TaskCardModel } from '@/modules/task/types/workInboxTypes';

export interface FocusRuntimeRedesignCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
  detail?: string;
}

function card(overrides: Partial<TaskCardModel> = {}): TaskCardModel {
  return {
    id: 't1',
    title: 'Test task',
    status: 'today',
    group: 'need_action',
    primaryActionLabel: 'Mở xử lý',
    primaryActionHref: '/inbox/t1',
    ...overrides,
  };
}

export function runFocusRuntimeRedesignChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: FocusRuntimeRedesignCheck[];
  warnings: string[];
} {
  const checks: FocusRuntimeRedesignCheck[] = [];
  const warnings: string[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: FocusRuntimeRedesignCheck['severity'] = pass ? 'OK' : 'ERROR',
    detail?: string,
  ) => {
    checks.push({ id, label, pass, severity, detail });
  };

  push(
    'UI_FOCUS_RUNTIME_DEFAULT_RENDER',
    'Focus Runtime default render path',
    panelSource.includes('WorkInboxFocusRuntime') &&
      panelSource.includes('isWorkInboxFocusRuntimeDefault') &&
      panelSource.includes("viewMode === 'focus'"),
    'CRITICAL',
  );

  push(
    'UI_COMPACT_SIDEBAR_RENDER',
    'Main operator sidebar with groups',
    sidebarSource.includes('VẬN HÀNH') &&
      sidebarSource.includes('NGHIỆP VỤ') &&
      sidebarSource.includes('HỆ THỐNG') &&
      sidebarSource.includes('Quá hạn'),
  );

  push(
    'UI_RIGHT_PANEL_TABS_SWITCH',
    'Right panel tab switch',
    tabsSource.includes('Chi tiết') &&
      tabsSource.includes('Timeline') &&
      tabsSource.includes('Handoff') &&
      tabsSource.includes('Tài liệu') &&
      tabsSource.includes('activeTab'),
  );

  push(
    'UI_PREV_NEXT_TASK_NAVIGATION',
    'Prev/next task navigation',
    workspaceSource.includes('goPrev') &&
      workspaceSource.includes('goNext') &&
      workspaceSource.includes('clampFocusIndex'),
  );

  push(
    'UI_BACK_TO_INBOX',
    'Back to inbox control',
    workspaceSource.includes('Quay lại inbox') && panelSource.includes('goBackToInbox'),
  );

  push(
    'UI_PRIMARY_ACTION_HANDLER_BOUND',
    'Primary action bound to open handler',
    actionSource.includes('onPrimary') &&
      panelSource.includes('onPrimary={handleOpenFocusItem}') &&
      actionSource.includes('▶ Bắt đầu xử lý'),
  );

  const secondaryFallback =
    feedbackSource.includes('Chức năng đang chuẩn bị') &&
    actionSource.includes('showFocusRuntimeFeedback');
  push(
    'UI_SECONDARY_ACTION_SAFE_FALLBACK',
    'Secondary action safe fallback toast',
    secondaryFallback,
    secondaryFallback ? 'OK' : 'ERROR',
  );

  push(
    'UI_NO_REPEATED_OPEN_BUTTONS_IN_FOCUS',
    'No repeated open buttons in focus workspace',
    !workspaceSource.includes('Mở xử lý') &&
      !runtimeSource.includes('WorkInboxTaskCardV3') &&
      panelSource.includes('hideOpenButton'),
  );

  push(
    'UI_BOTTOM_STATUS_BAR_RENDER',
    'Bottom status bar clearance / anchor',
    runtimeSource.includes('bottom-runtime-status-bar') &&
      shellSource.includes('work-inbox-shell__body--focus-safe'),
  );

  push(
    'UI_RESPONSIVE_1366_SAFE',
    '1366px responsive two-column grid',
    runtimeSource.includes('work-inbox-focus-runtime__body--two-col'),
  );

  push(
    'UI_FEATURE_FLAGS',
    'Focus runtime feature flags',
    featureSource.includes('isWorkInboxFocusRuntimeEnabled') &&
      featureSource.includes('isWorkInboxFocusRuntimeDefault'),
  );

  push(
    'UI_KPI_COMPACT_LINE',
    'KPI compact single line in inbox list mode',
    kpiSource.includes('compact-line') && panelSource.includes('variant="compact-line"'),
  );

  const navModel = mapTaskCardModelsToFocusItems([card(), card({ id: 't2' })]);
  push(
    'UI_FOCUS_INDEX_MODEL',
    'Focus index model bounds',
    navModel.length === 2 && clampFocusIndex(5, 2) === 1,
    'OK',
    '2 items',
  );

  if (!cardSource.includes('hideOpenButton')) {
    warnings.push('Task card hideOpenButton prop missing');
  }

  const anyFail = checks.some((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = anyFail
    ? 'FAIL'
    : warnings.length > 0
      ? 'GO_WITH_WARNINGS'
      : 'GO';

  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN',
    status,
    checks,
    warnings,
  };
}
