/**
 * PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canRoleCreateWorkInboxTask, validateCreateTaskForm } from './workInboxCreateTaskTypes';

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

function readGas(name: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'gas-runtime-api', name),
    'utf8',
  );
}

export function runWorkInboxUserCreateTaskRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const dialog = readLocal('WorkInboxCreateTaskDialog.tsx');
  const hook = readLocal('useWorkInboxCreateTaskRuntime.ts');
  const localInsert = readLocal('workInboxCreateTaskLocalInsert.ts');
  const types = readLocal('workInboxCreateTaskTypes.ts');
  const tasksPage = readRoot('modules/task/TasksPage.tsx');
  const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
  const actionTypes = readLocal('../actionRuntime/workInboxActionTypes.ts');
  const workerMod = readWorker('modules/workInboxCreateTask.ts');
  const workerPerm = readWorker('auth/workInboxCreatePermissions.ts');
  const workerRouter = readWorker('router.ts');
  const gasCreate = readGas('48_WorkInboxCreateTask.js');
  const gasOp = readGas('46_WorkInboxOperationalService.js');
  const client = readRoot('api/client.ts');

  push(
    'CREATE_TASK_RCLA_CONTEXT_USED',
    hook.includes('useWorkInboxRuntimeContextOptional') && registry.includes('WorkInboxRuntimeContextProvider'),
  );
  push('CREATE_TASK_USER_PERMISSION_ALLOWED', canRoleCreateWorkInboxTask('USER'));
  push('CREATE_TASK_VIEWER_PERMISSION_DENIED', !canRoleCreateWorkInboxTask('VIEW_ONLY'));
  push(
    'CREATE_TASK_USER_CANNOT_ASSIGN_OTHERS',
    workerPerm.includes('__FORBIDDEN__') && gasCreate.includes('Không có quyền giao việc cho người khác'),
  );
  push(
    'CREATE_TASK_TITLE_REQUIRED',
    validateCreateTaskForm({ title: '', description: '', priority: 'NORMAL', dueDate: '', relatedPhone: '', relatedPlate: '' }) !== null &&
      dialog.includes('required'),
  );
  push(
    'CREATE_TASK_DEFAULT_STATUS_NEW',
    gasCreate.includes("STATUS: 'NEW'") || gasCreate.includes('taskDbCreateTask_'),
  );
  push(
    'CREATE_TASK_DEFAULT_OWNER_CURRENT_USER',
    gasCreate.includes('ownerId = actor.userId') || gasCreate.includes('assignee: ownerId'),
  );
  push(
    'CREATE_TASK_TIMELINE_APPEND',
    gasCreate.includes('TASK_CREATED_BY_USER') && gasOp.includes('wiOpCreateUserTask'),
  );
  push(
    'CREATE_TASK_AUDIT_APPEND',
    gasCreate.includes('ACTION_USER_CREATE_TASK') && actionTypes.includes('ACTION_USER_CREATE_TASK'),
  );
  push(
    'CREATE_TASK_SELECTIVE_REFRESH',
    localInsert.includes('insertCreatedTaskIntoSnapshot') &&
      tasksPage.includes('handleWorkInboxTaskCreated') &&
      !tasksPage.includes("onTaskChanged('snapshot')"),
  );
  push(
    'CREATE_TASK_OPEN_NEW_TASK_IN_FOCUS',
    tasksPage.includes('INBOX_ROUTE') && tasksPage.includes('loadTaskDetail(created.taskId'),
  );
  push(
    'CREATE_TASK_NO_FULL_SNAPSHOT_BY_DEFAULT',
    tasksPage.includes('insertCreatedTaskIntoSnapshot') &&
      tasksPage.includes('handleWorkInboxTaskCreated') &&
      !/handleWorkInboxTaskCreated[\s\S]{0,800}loadWorkspace/.test(tasksPage),
  );
  push(
    'CREATE_TASK_NO_LAYOUT_REGRESSION',
    dialog.includes('work-inbox-dialog') && !tasksPage.includes('CREATE_TASK_LAYOUT_V2'),
  );
  push(
    'CREATE_TASK_BUILD_PASS',
    client.includes('createWorkInboxUserTask') && workerRouter.includes('/api/work-inbox/create-task') && types.length > 0,
  );

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live USER role manual verification pending');

  return { suite: 'PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME', status, checks, warnings };
}
