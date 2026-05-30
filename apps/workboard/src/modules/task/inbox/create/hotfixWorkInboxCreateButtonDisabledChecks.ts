/**
 * HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canRoleCreateWorkInboxTask } from './workInboxCreateTaskTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

function readWorker(rel: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'workers', 'api', 'src', rel),
    'utf8',
  );
}

export function runHotfixWorkInboxCreateButtonDisabledChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const statusBar = readRoot('components/runtime/RuntimeStatusBar.tsx');
  const taskWrite = readRoot('modules/task/TaskWriteContext.tsx');
  const tasksPage = readRoot('modules/task/TasksPage.tsx');
  const dialog = readLocal('WorkInboxCreateTaskDialog.tsx');
  const hook = readLocal('useWorkInboxCreateTaskRuntime.ts');
  const constants = readRoot('shared/constants/index.ts');
  const client = readRoot('api/client.ts');
  const taskPerm = readWorker('auth/taskPermissions.ts');
  const createPerm = readWorker('auth/workInboxCreatePermissions.ts');

  push('CREATE_BUTTON_NOT_DISABLED_FOR_USER', canRoleCreateWorkInboxTask('USER'));
  push('CREATE_BUTTON_NOT_DISABLED_FOR_OPERATOR', canRoleCreateWorkInboxTask('STAFF'));
  push(
    'CREATE_BUTTON_OPENS_DIALOG',
    statusBar.includes('openWorkInboxCreate') &&
      taskWrite.includes('registerOpenWorkInboxCreate') &&
      tasksPage.includes('setWorkInboxCreateOpen(true)'),
  );
  push(
    'CREATE_DIALOG_SUBMIT_CALLS_API',
    hook.includes('createWorkInboxUserTask') && client.includes('/api/work-inbox/create-task'),
  );
  push('VIEWER_CREATE_BUTTON_DISABLED', !canRoleCreateWorkInboxTask('VIEW_ONLY'));
  push(
    'CREATE_TASK_OPENS_FOCUS',
    tasksPage.includes('handleWorkInboxTaskCreated') && tasksPage.includes('INBOX_ROUTE'),
  );
  push(
    'NO_FULL_SNAPSHOT_AFTER_CREATE',
    tasksPage.includes('insertCreatedTaskIntoSnapshot') &&
      !/handleWorkInboxTaskCreated[\s\S]{0,800}loadWorkspace/.test(tasksPage),
  );
  push(
    'CREATE_BUTTON_LABEL_FIXED',
    constants.includes("'+ Tạo việc'") && statusBar.includes("'+ Tạo việc'"),
  );
  push(
    'CREATE_BUTTON_PERMISSION_TOOLTIP',
    statusBar.includes('Bạn không có quyền tạo việc') && !statusBar.includes('isCreate && locked &&'),
  );
  push(
    'CREATE_OPERATOR_WORKER_PERMISSION',
    taskPerm.includes("user.role === 'STAFF'") && createPerm.includes('OPERATOR'),
  );
  push('CREATE_TASK_BUILD_PASS', dialog.includes('WorkInboxCreateTaskDialog') && dialog.length > 0);

  const failed = checks.filter((c) => !c.pass);
  return {
    suite: 'HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED',
    status: failed.length > 0 ? 'FAIL' : 'GO',
    checks,
  };
}
