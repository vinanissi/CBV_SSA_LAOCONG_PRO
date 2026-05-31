/**
 * PHASE_WORK_INBOX_RUNTIME_STABILIZATION — static verification.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateTaskMainRuntimeHealth } from '@/shared/utils/taskMainRuntimeHealth';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

export function runWorkInboxRuntimeStabilizationChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const tasksPage = readRoot('modules/task/TasksPage.tsx');
  const healthUtil = readFileSync(join(__dir, '..', '..', '..', '..', 'shared', 'utils', 'taskMainRuntimeHealth.ts'), 'utf8');
  const telemetry = readFileSync(join(__dir, '..', '..', '..', '..', 'shared', 'utils', 'runtimeTelemetry.ts'), 'utf8');
  const shared = readLocal('focusLayoutShared.ts');
  const right = readLocal('RightContextTabs.tsx');
  const opBundle = readRoot('modules/task/inbox/operationalRuntime/useWorkInboxOperationalBundle.ts');
  const checklistHook = readRoot('modules/task/inbox/checklist/useWorkInboxChecklistRuntime.ts');
  const attachHook = readRoot('modules/task/inbox/attachments/useWorkInboxAttachmentsRuntime.ts');

  const slowHealth = evaluateTaskMainRuntimeHealth({
    connected: true,
    error: null,
    hasSnapshot: true,
    warnings: ['TASK_MAIN phản hồi chậm — vẫn đồng bộ được'],
    runtime: { mode: 'google_sheet_existing_db', workerLatencyMs: 3500, connected: true } as never,
  });
  const staleHealth = evaluateTaskMainRuntimeHealth({
    connected: true,
    error: 'timeout',
    hasSnapshot: true,
    warnings: ['Không kết nối — đang hiển thị bản gần nhất'],
    runtime: { mode: 'google_sheet_existing_db', connected: true } as never,
  });

  push('HEALTH_SLOW_NOT_DEGRADED', slowHealth.state === 'slow_live' && !slowHealth.degraded);
  push('HEALTH_STALE_IS_DEGRADED', staleHealth.degraded && staleHealth.operatorLabel.includes('lưu tạm'));
  push('TASKS_PAGE_USES_HEALTH_EVAL', tasksPage.includes('evaluateTaskMainRuntimeHealth'));
  push('TASKS_PAGE_NO_GENERIC_CHAM_DEGRADED', !tasksPage.includes("w.includes('chậm')"));
  push('TELEMETRY_OPERATOR_LABEL', telemetry.includes('getCompactConnectionLabelFromTelemetry'));
  push('TIMELINE_STATUS_TRANSITIONS', shared.includes('NEW -> IN_PROGRESS') && shared.includes('Bắt đầu xử lý'));
  push('TIMELINE_HANDOFF_EVENTS', shared.includes('HANDOFF_CREATED') && shared.includes('HANDOFF_ACCEPTED'));
  push('TIMELINE_ACTOR_FORMAT', shared.includes('formatFocusTimelineActor'));
  push('HANDOFF_BUILD_VIEW', right.includes('buildFocusHandoffView') && right.includes('Chưa có bàn giao'));
  push('OP_BUNDLE_CLEAR_DEGRADED_ON_OK', opBundle.includes('setDegraded(false)') && opBundle.includes('envelope.ok'));
  push('CHECKLIST_NO_SNAPSHOT_RELOAD', !checklistHook.includes('getTaskWorkspaceSnapshot'));
  push('ATTACH_NO_SNAPSHOT_RELOAD', !attachHook.includes('getTaskWorkspaceSnapshot'));
  push('HEALTH_UTIL_EXISTS', healthUtil.includes('operatorLabel'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Pilot: verify status bar after live Worker/GAS reconnect');
  warnings.push('Real Sheet latency may still show stale message — expected GO_WITH_WARNINGS_FOR_PILOT');

  return { suite: 'PHASE_WORK_INBOX_RUNTIME_STABILIZATION', status, checks, warnings };
}
