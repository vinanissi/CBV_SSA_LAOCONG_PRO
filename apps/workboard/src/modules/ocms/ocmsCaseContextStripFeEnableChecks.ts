/**
 * PHASE_OCMS_03D_ENABLE_CASE_CONTEXT_STRIP_FE — static enablement checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskItem } from '@/api/contracts';
import { buildCaseContextStripView } from './buildCaseContextStripView';
import { deriveCaseReadModel } from './deriveCaseReadModel';
import { isOcmsCaseStripEnabled } from './ocmsFeature';
import { resolveOcmsFocusTask } from './ocmsFocusTaskResolver';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readFocus(name: string): string {
  return readFileSync(join(__dir, '..', 'task', 'inbox', 'focusRuntime', name), 'utf8');
}

function sampleTask(): TaskItem {
  return {
    taskId: 'T-FE-03D',
    title: 'Kiểm tra strip OCMS',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    owner: 'u1',
    ownerId: 'u1',
    ownerDisplayName: 'Nguyễn A',
    dueDate: '',
    href: '/inbox/T-FE-03D',
    permissionAllowed: true,
    module: 'TASK',
    source: 'TASK_MAIN',
  };
}

export function runOcmsCaseContextStripFeEnableChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = [];
  const skipped: string[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const workspace = readFocus('FocusTaskWorkspace.tsx');
  const runtime = readFocus('WorkInboxFocusRuntime.tsx');
  const strip = readLocal('WorkInboxCaseContextStrip.tsx');
  const envExample = readFileSync(join(__dir, '..', '..', '..', '.env.example'), 'utf8');

  push('FE03D_ENV_DOCUMENTED', envExample.includes('VITE_OCMS_CASE_STRIP_ENABLED'));
  push(
    'FE03D_STRIP_BELOW_HEADER',
    workspace.includes('<CompactTaskHeader') &&
      workspace.indexOf('<WorkInboxCaseContextStrip') > workspace.indexOf('<CompactTaskHeader') &&
      workspace.indexOf('<FocusContentCards') > workspace.indexOf('<WorkInboxCaseContextStrip'),
  );
  push('FE03D_TASK_DETAIL_WIRED', runtime.includes('taskDetail') && workspace.includes('taskDetail'));
  push('FE03D_FOCUS_TASK_RESOLVER', readLocal('ocmsFocusTaskResolver.ts').includes('resolveOcmsFocusTask'));
  push(
    'FE03D_STRIP_FIELDS',
    strip.includes('discoverySourceLabel') &&
      strip.includes('caseIdentityLabel') &&
      strip.includes('relationsSummary'),
  );
  push('FE03D_NO_RAW_KEY', !strip.includes('caseKey'));
  push(
    'FE03D_FLAG_OFF_CONDITIONAL',
    workspace.includes('ocmsStripOn && stripView') && readLocal('ocmsFeature.ts').includes("flag === 'true'"),
  );

  const model = deriveCaseReadModel({ task: sampleTask() });
  const view = model ? buildCaseContextStripView(model, 'MINIMAL') : null;
  push('FE03D_DERIVE_PRODUCES_VIEW', Boolean(view?.caseTypeLabel && view.discoverySourceLabel));
  push('FE03D_IDENTITY_NOT_RAW_KEY', !view?.caseIdentityLabel?.includes('OPERATIONS:TASK'));

  const resolved = resolveOcmsFocusTask(undefined, null, {
    id: 'T-FE-03D',
    title: 'Focus card',
    status: 'today',
    group: 'need_action',
    progressIndex: 1,
    progressTotal: 1,
    detailHref: '/inbox/T-FE-03D',
    canComplete: true,
    canForward: true,
    canPause: true,
    primaryActionLabel: 'Mở',
    primaryActionHref: '/inbox/T-FE-03D',
  });
  push('FE03D_FOCUS_FALLBACK_TASK', resolved?.taskId === 'T-FE-03D');

  if (!isOcmsCaseStripEnabled()) {
    warnings.push('VITE_OCMS_CASE_STRIP_ENABLED not true in check process — set in .env.local for dev');
  }

  skipped.push('Live browser screenshot — run manual Focus Mode verification with flag ON');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    suite: 'PHASE_OCMS_03D_ENABLE_CASE_CONTEXT_STRIP_FE',
    status,
    checks,
    warnings,
    skipped,
  };
}
