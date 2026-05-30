/**
 * PHASE_UI_CBV_WORK_INBOX_V3_FINAL_IMAGE_B_IMPLEMENTATION — CBV_TCS_V1
 */

import layoutSource from './imageB/WorkInboxV3ImageBLayout.tsx?raw';
import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import workspaceSource from './focusRuntime/FocusTaskWorkspace.tsx?raw';
import headerSource from './focusRuntime/FocusHeader.tsx?raw';
import badgesSource from './focusRuntime/QuickContextBadges.tsx?raw';
import actionSource from './focusRuntime/FocusActionBar.tsx?raw';
import cardsSource from './focusRuntime/FocusContentCards.tsx?raw';
import tabsSource from './focusRuntime/RightContextTabs.tsx?raw';
import metadataSource from './focusRuntime/TaskMetadataRow.tsx?raw';
import sidebarSource from '@/components/layout/OperatorMainSidebar.tsx?raw';
import appShellSource from '@/components/layout/AppShell.tsx?raw';
import panelSource from './WorkInboxGroupsPanel.tsx?raw';
import feedbackSource from './focusRuntime/focusRuntimeFeedback.ts?raw';
import copySource from '@/shared/utils/operatorFeedbackCopy.ts?raw';

export interface FocusRuntimeImageBCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export function runFocusRuntimeImageBChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: FocusRuntimeImageBCheck[];
  warnings: string[];
} {
  const checks: FocusRuntimeImageBCheck[] = [];
  const warnings: string[] = [];

  const push = (id: string, label: string, pass: boolean, severity: FocusRuntimeImageBCheck['severity'] = pass ? 'OK' : 'ERROR') => {
    checks.push({ id, label, pass, severity });
  };

  push(
    'UI_IMAGE_B_LAYOUT_RENDER',
    'Image B layout wrapper',
    layoutSource.includes('WorkInboxV3ImageBLayout') && runtimeSource.includes('WorkInboxV3ImageBLayout'),
    'CRITICAL',
  );

  push(
    'UI_SINGLE_LEFT_SIDEBAR_ONLY',
    'Single operator sidebar',
    sidebarSource.includes('operator-main-sidebar') && !runtimeSource.includes('CompactSidebar'),
    'CRITICAL',
  );

  push('UI_NO_NESTED_LEFT_PANEL', 'No nested left in main', !panelSource.includes('CompactSidebar'), 'CRITICAL');

  push(
    'UI_SINGLE_RIGHT_CONTEXT_PANEL_ONLY',
    'Right tabs only in focus body',
    tabsSource.includes('work-inbox-right-context-tabs') && runtimeSource.includes('RightContextTabs'),
    'CRITICAL',
  );

  push(
    'UI_NO_LEGACY_RIGHT_DETAIL_PANEL',
    'DetailPanel suppressed',
    appShellSource.includes('!suppressGlobalDetailPanel && <DetailPanel />'),
    'CRITICAL',
  );

  push(
    'UI_FOCUS_MODE_HEADER_RENDER',
    'Focus header',
    headerSource.includes('FOCUS MODE') && headerSource.includes('Sau ›'),
  );

  push(
    'UI_QUICK_BADGES_RENDER',
    'Quick badges',
    badgesSource.includes('work-inbox-quick-badges') && workspaceSource.includes('QuickContextBadges'),
  );

  push(
    'UI_ACTION_BAR_RENDER',
    'Action bar with icons',
    actionSource.includes('▶ Bắt đầu xử lý') && actionSource.includes('⏸ Tạm dừng'),
  );

  push(
    'UI_PRIMARY_ACTION_BOUND',
    'Primary bound',
    panelSource.includes('onPrimary={handleOpenFocusItem}') && actionSource.includes('onPrimary'),
  );

  push(
    'UI_SECONDARY_ACTION_SAFE_FALLBACK',
    'Secondary fallback',
    feedbackSource.includes('Chức năng đang chuẩn bị') && actionSource.includes('showFocusRuntimeFeedback'),
  );

  push(
    'UI_RIGHT_TABS_SWITCH',
    'Tab switch',
    tabsSource.includes('activeTab') && tabsSource.includes('Nhập ghi chú'),
  );

  push(
    'UI_PREV_NEXT_NAVIGATION',
    'Prev/next',
    headerSource.includes('‹ Trước') && workspaceSource.includes('goNext'),
  );

  push('UI_BACK_TO_INBOX', 'Back to inbox', headerSource.includes('Quay lại inbox'));

  push('UI_BOTTOM_STATUS_BAR_RENDER', 'Status anchor', runtimeSource.includes('bottom-runtime-status-bar'));

  push(
    'UI_1366x768_VIEWPORT_SAFE',
    'Two-column responsive',
    runtimeSource.includes('work-inbox-focus-runtime__body--two-col'),
  );

  push(
    'UI_NO_HORIZONTAL_SCROLL',
    'No nested 3-col grid',
    !runtimeSource.includes('grid-template-columns: minmax(148px'),
  );

  push(
    'UI_IMAGE_B_CONTENT_CARDS',
    'Checklist + related info',
    cardsSource.includes('type="checkbox"') && cardsSource.includes('THÔNG TIN LIÊN QUAN'),
  );

  push(
    'UI_TOPBAR_SEARCH_PLACEHOLDER',
    'Search placeholder image B',
    copySource.includes('mã việc'),
  );

  push('UI_METADATA_ROW', 'Metadata row component', metadataSource.includes('Người phụ trách'));

  const anyFail = checks.some((c) => !c.pass);
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_FINAL_IMAGE_B_IMPLEMENTATION',
    status: anyFail ? 'FAIL' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    checks,
    warnings,
  };
}
