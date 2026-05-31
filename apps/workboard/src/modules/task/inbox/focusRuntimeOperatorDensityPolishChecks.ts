/**
 * PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH — CBV_TCS_V1
 */

import appShellSource from '@/components/layout/AppShell.tsx?raw';
import detailSource from '@/components/layout/DetailPanel.tsx?raw';
import cardsSource from './focusRuntime/FocusContentCards.tsx?raw';
import tabsSource from './focusRuntime/RightContextTabs.tsx?raw';
import previewSource from './focusRuntime/FocusPreviewCards.tsx?raw';
import workspaceSource from './focusRuntime/FocusTaskWorkspace.tsx?raw';
import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import cssSource from '@/styles/index.css?raw';

export interface OperatorDensityPolishCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'ERROR' | 'CRITICAL';
}

export function runFocusRuntimeOperatorDensityPolishChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: OperatorDensityPolishCheck[];
} {
  const checks: OperatorDensityPolishCheck[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: OperatorDensityPolishCheck['severity'] = pass ? 'OK' : 'ERROR',
  ) => {
    checks.push({ id, label, pass, severity });
  };

  push(
    'UI_OPERATOR_DENSITY_PREVIEW_TIMELINE',
    'Timeline in right panel (rebalance)',
    !cardsSource.includes('TimelinePreviewCard') &&
      tabsSource.includes('formatFocusTimelineFriendlyLabel') &&
      previewSource.includes('TIMELINE PREVIEW'),
    'CRITICAL',
  );

  push(
    'UI_OPERATOR_DENSITY_PREVIEW_HANDOFF',
    'Handoff in right panel (rebalance)',
    !cardsSource.includes('HandoffPreviewCard') &&
      tabsSource.includes('Chưa có bàn giao cho việc này'),
    'CRITICAL',
  );

  push(
    'UI_OPERATOR_DENSITY_PREVIEW_DOCUMENTS',
    'Documents preview only when files exist',
    previewSource.includes('DocumentsPreviewCard') &&
      previewSource.includes('if (files.length === 0) return null'),
    'CRITICAL',
  );

  push(
    'UI_OPERATOR_DENSITY_TASK_DETAIL_WIRED',
    'TaskDetail wired to right panel without API change',
    runtimeSource.includes('taskDetail={taskDetail}') &&
      tabsSource.includes('taskDetail') &&
      cardsSource.includes('work-inbox-focus-content-cards--stack'),
    'CRITICAL',
  );

  push(
    'UI_OPERATOR_DENSITY_WORKSPACE_70VH',
    'Main workspace ~70% viewport height',
    cssSource.includes('min-height: 70vh') &&
      cssSource.includes('work-inbox-focus-workspace--density'),
    'CRITICAL',
  );

  push(
    'UI_OPERATOR_DENSITY_REDUCE_BOTTOM_WHITESPACE',
    'Reduced bottom padding on focus workspace',
    cssSource.includes('pb-0') && cssSource.includes('main-canvas--focus'),
  );

  push(
    'UI_RIGHT_PANEL_WIDTH_360_400',
    'Right context panel 360–400px',
    cssSource.includes('min-width: 360px') &&
      cssSource.includes('max-width: 400px') &&
      cssSource.includes('width: 392px'),
    'CRITICAL',
  );

  push(
    'UI_1366x768_CORE_CONTENT_VISIBLE',
    'Density grid + preview cards for viewport fit',
    cardsSource.includes('work-inbox-focus-content-cards--density') &&
      previewSource.includes('line-clamp'),
  );

  push(
    'UI_NO_HORIZONTAL_SCROLL',
    'Workspace overflow-x hidden preserved',
    appShellSource.includes('overflow-x-hidden') && cssSource.includes('overflow-x-hidden'),
  );

  push(
    'UI_THREE_REGION_LAYOUT_PRESERVED',
    'No legacy panel; portal right tabs',
    detailSource.includes('hideLegacyContextPanel') &&
      runtimeSource.includes('createPortal') &&
      appShellSource.includes('right-context-tabs-outer'),
    'CRITICAL',
  );

  const anyFail = checks.some((c) => !c.pass);
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH',
    status: anyFail ? 'FAIL' : 'GO',
    checks,
  };
}
