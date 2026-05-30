/**
 * PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH — CBV_TCS_V1
 */

import appShellSource from '@/components/layout/AppShell.tsx?raw';
import detailSource from '@/components/layout/DetailPanel.tsx?raw';
import cardsSource from './focusRuntime/FocusContentCards.tsx?raw';
import headerSource from './focusRuntime/FocusHeader.tsx?raw';
import badgesSource from './focusRuntime/QuickContextBadges.tsx?raw';
import actionSource from './focusRuntime/FocusActionBar.tsx?raw';
import tabsSource from './focusRuntime/RightContextTabs.tsx?raw';
import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import cssSource from '@/styles/index.css?raw';

export interface FocusRuntimeVisualPolishCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'ERROR' | 'CRITICAL';
}

export function runFocusRuntimeImageBVisualPolishChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: FocusRuntimeVisualPolishCheck[];
} {
  const checks: FocusRuntimeVisualPolishCheck[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: FocusRuntimeVisualPolishCheck['severity'] = pass ? 'OK' : 'ERROR',
  ) => {
    checks.push({ id, label, pass, severity });
  };

  push(
    'UI_IMAGE_B_VISUAL_GRID_2_COLUMN',
    'Content cards use 2-column grid (summary+checklist | related)',
    cardsSource.includes('work-inbox-focus-content-cards--grid') &&
      cardsSource.includes('work-inbox-focus-content-cards__left') &&
      cardsSource.includes('work-inbox-focus-card--related') &&
      cssSource.includes('grid-template-columns: minmax(0, 1.15fr)'),
    'CRITICAL',
  );

  push(
    'UI_ACTION_BAR_NOT_FULL_WIDTH',
    'Primary action not full-width; inline with secondary',
    actionSource.includes('work-inbox-focus-action-bar--inline') &&
      cssSource.includes('max-width: 360px') &&
      !actionSource.includes('w-full'),
    'CRITICAL',
  );

  push(
    'UI_RIGHT_PANEL_WIDTH_SAFE',
    'Right panel 360–400px',
    cssSource.includes('min-width: 360px') &&
      cssSource.includes('max-width: 400px') &&
      cssSource.includes('width: 380px'),
    'CRITICAL',
  );

  push(
    'UI_FOCUS_HEADER_PILL_RENDER',
    'Focus mode center pill badge',
    headerSource.includes('work-inbox-focus-header__center-pill') &&
      headerSource.includes('FOCUS MODE') &&
      cssSource.includes('work-inbox-focus-header__center-pill'),
    'CRITICAL',
  );

  push(
    'UI_QUICK_BADGES_CHIP_STYLE',
    'Semantic chip variants per badge type',
    badgesSource.includes('work-inbox-quick-badges__chip--need-action') &&
      badgesSource.includes('work-inbox-quick-badges__chip--urgent') &&
      badgesSource.includes('work-inbox-quick-badges__chip--sla-ok') &&
      cssSource.includes('work-inbox-quick-badges__chip--open'),
    'CRITICAL',
  );

  push(
    'UI_1366x768_CORE_CONTENT_VISIBLE',
    'Compact spacing tokens for viewport density',
    cssSource.includes('line-clamp-3') &&
      cssSource.includes('work-inbox-focus-action-bar--inline') &&
      cssSource.includes('work-inbox-focus-content-cards--grid'),
  );

  push(
    'UI_NO_HORIZONTAL_SCROLL',
    'Workspace layout overflow-x hidden',
    appShellSource.includes('overflow-x-hidden') && cssSource.includes('overflow-x-hidden'),
    'CRITICAL',
  );

  push(
    'UI_THREE_REGION_LAYOUT_PRESERVED',
    'No legacy panel; portal right tabs',
    detailSource.includes('hideLegacyContextPanel') &&
      runtimeSource.includes('createPortal') &&
      appShellSource.includes('right-context-tabs-outer'),
    'CRITICAL',
  );

  push(
    'UI_RIGHT_TABS_QUICK_ACTIONS_GRID',
    'Quick actions 2-column grid in right panel',
    tabsSource.includes('work-inbox-right-context-tabs__quick-actions') &&
      cssSource.includes('grid-cols-2'),
  );

  push(
    'UI_SIDEBAR_WIDTH_220',
    'Left sidebar fixed 220px',
    cssSource.includes('w-[220px]') && cssSource.includes('max-w-[220px]'),
  );

  const anyFail = checks.some((c) => !c.pass);
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH',
    status: anyFail ? 'FAIL' : 'GO',
    checks,
  };
}
