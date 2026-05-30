/**
 * PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxActionRuntimeChecks } from './src/modules/task/inbox/actionRuntime/workInboxActionRuntimeChecks.ts'; console.log(runWorkInboxActionRuntimeChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(relativePath: string): string {
  return readFileSync(join(__dir, relativePath), 'utf8');
}

function readFromRoot(relativeToWorkboardSrc: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', relativeToWorkboardSrc.replace(/^\//, '')),
    'utf8',
  );
}

const executorSource = readLocal('workInboxActionExecutor.ts');
const hookSource = readLocal('useWorkInboxActionRuntime.ts');
const typesSource = readLocal('workInboxActionTypes.ts');
const auditSource = readLocal('workInboxActionAudit.ts');
const hostSource = readLocal('WorkInboxFocusActionHost.tsx');
const registrySource = readFromRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const panelSource = readLocal('../WorkInboxGroupsPanel.tsx');
const actionBarSource = readLocal('../focusRuntime/FocusActionBar.tsx');
const tabsSource = readLocal('../focusRuntime/RightContextTabs.tsx');
const workspaceSource = readLocal('../focusRuntime/FocusTaskWorkspace.tsx');
const pauseDlgSource = readLocal('dialogs/PauseReasonDialog.tsx');
const handoffDlgSource = readLocal('dialogs/HandoffDialog.tsx');

export interface WorkInboxActionRuntimeCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
  detail?: string;
}

export function runWorkInboxActionRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: WorkInboxActionRuntimeCheck[];
  warnings: string[];
} {
  const checks: WorkInboxActionRuntimeCheck[] = [];
  const warnings: string[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: WorkInboxActionRuntimeCheck['severity'] = pass ? 'OK' : 'ERROR',
    detail?: string,
  ) => {
    checks.push({ id, label, pass, severity, detail });
  };

  push(
    'ACTION_START_PROCESSING_HANDLER',
    'Start processing handler (NEW → IN_PROGRESS)',
    executorSource.includes("case 'ACTION_START_PROCESSING'") &&
      executorSource.includes("'IN_PROGRESS'") &&
      executorSource.includes('TASK_STARTED') &&
      executorSource.includes('ACTION_START_PROCESSING'),
  );

  push(
    'ACTION_PAUSE_HANDLER',
    'Pause handler with reason dialog',
    executorSource.includes("case 'ACTION_PAUSE_TASK'") &&
      pauseDlgSource.includes('PAUSE_REASON_OPTIONS') &&
      typesSource.includes('Chờ khách hàng') &&
      hookSource.includes('setPauseDialogOpen'),
  );

  push(
    'ACTION_HANDOFF_HANDLER',
    'Handoff handler with assign API',
    executorSource.includes("case 'ACTION_HANDOFF'") &&
      executorSource.includes('assignTask') &&
      handoffDlgSource.includes('recipient'),
  );

  push(
    'ACTION_MENU_HANDLER',
    'More actions menu bound',
    actionBarSource.includes('Thao tác khác') &&
      actionBarSource.includes('ACTION_MORE_COPY_LINK') &&
      hookSource.includes('onMoreAction'),
  );

  push(
    'ACTION_CALL_HANDLER',
    'Call quick action + audit',
    hookSource.includes('onQuickCall') && executorSource.includes("case 'ACTION_CALL_CLICK'"),
  );

  push(
    'ACTION_MESSAGE_HANDLER',
    'Message quick action + audit',
    hookSource.includes('onQuickMessage') && executorSource.includes("case 'ACTION_MESSAGE_CLICK'"),
  );

  push(
    'ACTION_APPOINTMENT_HANDLER',
    'Appointment action + timeline',
    executorSource.includes("case 'ACTION_CREATE_APPOINTMENT'") &&
      executorSource.includes('TASK_APPOINTMENT_CREATED'),
  );

  push(
    'ACTION_NEXT_TASK_HANDLER',
    'Navigate next loads task',
    hookSource.includes('onNavigateNext') &&
      hookSource.includes('onOpenItem') &&
      workspaceSource.includes('onNavigateNext'),
  );

  push(
    'ACTION_PREVIOUS_TASK_HANDLER',
    'Navigate previous loads task',
    hookSource.includes('onNavigatePrev') && workspaceSource.includes('onNavigatePrev'),
  );

  push(
    'ACTION_TIMELINE_APPEND',
    'Timeline append via comment API',
    executorSource.includes('appendTimeline') && executorSource.includes('addTaskComment'),
  );

  push(
    'ACTION_AUDIT_APPEND',
    'Session audit append-only',
    auditSource.includes('appendWorkInboxActionAudit') && !auditSource.includes('overwrite'),
  );

  push(
    'ACTION_TOAST_FEEDBACK',
    'Toast feedback on action result',
    hookSource.includes('showFocusRuntimeFeedback') && executorSource.includes('message:'),
  );

  push(
    'ACTION_CONTEXT_REFRESH',
    'Context refresh after mutations',
    executorSource.includes('onRefresh') && executorSource.includes('onTaskUpdated'),
  );

  push(
    'ACTION_PERMISSION_CHECK',
    'Permission gate in executor',
    executorSource.includes('permissions.canWrite') && executorSource.includes('permissions.canAssign'),
  );

  push(
    'ACTION_ENVELOPE_CONTRACT',
    'Action result envelope fields',
    typesSource.includes('timelineWritten') &&
      typesSource.includes('auditWritten') &&
      typesSource.includes('traceId'),
  );

  push(
    'RCLA_REGISTRY_PROVIDER',
    'RCLA registry provider (no ad-hoc context)',
    hostSource.includes('WorkInboxRuntimeContextProvider') &&
      registrySource.includes('useWorkInboxRuntimeContext') &&
      hookSource.includes('useWorkInboxRuntimeContext'),
    'CRITICAL',
  );

  push(
    'ACTION_HOST_WIRED_IN_PANEL',
    'Focus panel uses action host',
    panelSource.includes('WorkInboxFocusActionHost'),
    'CRITICAL',
  );

  push(
    'RIGHT_PANEL_REAL_TIMELINE',
    'Right panel timeline from taskDetail',
    tabsSource.includes('recentUpdates') || tabsSource.includes('timeline'),
  );

  push(
    'RIGHT_PANEL_QUICK_ACTIONS',
    'Right panel quick actions wired',
    tabsSource.includes('onQuickCall') && hostSource.includes('onQuickCall'),
  );

  const failCount = checks.filter((c) => !c.pass && (c.severity === 'ERROR' || c.severity === 'CRITICAL')).length;
  const warnCount = checks.filter((c) => !c.pass && c.severity === 'WARNING').length;

  if (warnCount) warnings.push(`${warnCount} warning-level check(s)`);

  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failCount > 0 ? 'FAIL' : warnCount > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME',
    status,
    checks,
    warnings,
  };
}
