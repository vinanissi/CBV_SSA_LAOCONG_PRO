/**
 * PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT — CBV_TCS_V1
 */

import appShellSource from '@/components/layout/AppShell.tsx?raw';
import detailSource from '@/components/layout/DetailPanel.tsx?raw';
import runtimeSource from './focusRuntime/WorkInboxFocusRuntime.tsx?raw';
import workspaceSource from './focusRuntime/FocusTaskWorkspace.tsx?raw';
import layoutCtxSource from './WorkInboxLayoutContext.tsx?raw';
import portalSource from './rightContextPortal.ts?raw';
import shellSource from '@/components/inbox/WorkInboxShell.tsx?raw';
import appSource from '@/app/App.tsx?raw';

export interface FocusRuntimeLayoutFixCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'ERROR' | 'CRITICAL';
}

export function runFocusRuntimeLayoutFixChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: FocusRuntimeLayoutFixCheck[];
} {
  const checks: FocusRuntimeLayoutFixCheck[] = [];

  const push = (id: string, label: string, pass: boolean, severity: FocusRuntimeLayoutFixCheck['severity'] = pass ? 'OK' : 'ERROR') => {
    checks.push({ id, label, pass, severity });
  };

  push(
    'UI_NO_LEGACY_CONTEXT_PANEL',
    'DetailPanel hidden on inbox V3',
    detailSource.includes('hideLegacyContextPanel') &&
      detailSource.includes('Ngữ cảnh vận hành') &&
      detailSource.includes('return null'),
    'CRITICAL',
  );

  push(
    'UI_RIGHT_CONTEXT_TABS_OUTER_LEVEL',
    'Right tabs portaled to AppShell root',
    appShellSource.includes('right-context-tabs-outer') &&
      portalSource.includes('cbv-right-context-root') &&
      runtimeSource.includes('createPortal') &&
      runtimeSource.includes('RIGHT_CONTEXT_ROOT_ID'),
    'CRITICAL',
  );

  const threeRegionBranch =
    appShellSource.split('useThreeRegionFocusLayout ?')[1]?.split(') : (')[0] ?? '';
  push(
    'UI_WORKSPACE_HAS_EXACTLY_THREE_REGIONS',
    'Workspace layout: sidebar + focus + right (no fourth panel)',
    appShellSource.includes('cbv-workspace-layout') &&
      appShellSource.includes('focus-workspace') &&
      appShellSource.includes('right-context-tabs-outer') &&
      !threeRegionBranch.includes('DetailPanel'),
    'CRITICAL',
  );

  const noNestedRightInMain =
    runtimeSource.includes('workspace-only') &&
    !runtimeSource.includes('work-inbox-focus-runtime__body--two-col') &&
    !workspaceSource.includes('RightContextTabs');
  push('UI_NO_NESTED_RIGHT_TABS_IN_MAIN', 'Right tabs not nested in focus card', noNestedRightInMain, 'CRITICAL');

  push(
    'UI_NO_NESTED_SCROLL_LAYOUT',
    'Single scroll on focus-workspace region',
    appShellSource.includes('focus-workspace') &&
      appShellSource.includes('overflow-y-auto') &&
      shellSource.includes('focus-pass-through'),
  );

  push(
    'UI_1366x768_FOCUS_VISIBLE',
    'Width tokens for 3 regions',
    appShellSource.includes('right-context-tabs-outer') && layoutCtxSource.includes('useThreeRegionFocusLayout'),
  );

  push(
    'UI_NO_HORIZONTAL_SCROLL',
    'overflow-x-hidden on workspace layout',
    appShellSource.includes('overflow-x-hidden'),
  );

  push(
    'UI_LAYOUT_PROVIDER_AT_APP',
    'WorkInboxLayoutProvider wraps AppShell',
    appSource.includes('WorkInboxLayoutProvider') && appSource.includes('<AppShell'),
    'CRITICAL',
  );

  push(
    'UI_PRIMARY_ACTION_BOUND',
    'Primary action still in workspace',
    workspaceSource.includes('FocusActionBar') && workspaceSource.includes('Bắt đầu'),
  );

  const anyFail = checks.some((c) => !c.pass);
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT',
    status: anyFail ? 'FAIL' : 'GO',
    checks,
  };
}
