import type { CreateTaskBody, TaskWriteEvent, UpdateTaskBody, UserContext } from '../contracts';
import type { StoredTask } from '../auth/taskPermissions';

const PROJECTION_LABEL = 'Worker local write — RF_11';

const timelineLog: TaskWriteEvent[] = [];
const taskStore = new Map<string, StoredTask>();

const ASSIGNEE_MAP: Record<string, { userId: string; displayName: string }> = {
  'USR-LOCAL-ADMIN': { userId: 'USR-LOCAL-ADMIN', displayName: 'Quản trị Local' },
  'USR-LOCAL-MGR': { userId: 'USR-LOCAL-MGR', displayName: 'Quản lý Local' },
  'USR-LOCAL-STAFF': { userId: 'USR-LOCAL-STAFF', displayName: 'Nhân viên Local' },
  'USR-LOCAL-FIN': { userId: 'USR-LOCAL-FIN', displayName: 'Tài chính Local' },
  'USR-LOCAL-HS': { userId: 'USR-LOCAL-HS', displayName: 'Hồ sơ Local' },
};

function resolveAssignee(assignee: string | undefined, fallback: UserContext) {
  if (!assignee?.trim()) {
    return { ownerId: fallback.userId, owner: fallback.displayName };
  }
  const key = assignee.trim();
  const byId = ASSIGNEE_MAP[key];
  if (byId) return { ownerId: byId.userId, owner: byId.displayName };
  const byName = Object.values(ASSIGNEE_MAP).find((a) => a.displayName === key);
  if (byName) return { ownerId: byName.userId, owner: byName.displayName };
  return { ownerId: key, owner: key };
}

function appendEvent(
  taskId: string,
  actor: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  note: string,
  traceId: string,
): TaskWriteEvent {
  const event: TaskWriteEvent = {
    eventId: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    taskId,
    actor,
    action,
    before,
    after,
    note,
    createdAt: new Date().toISOString(),
    traceId,
    source: 'RF_11_TASK_WRITE_RUNTIME',
  };
  timelineLog.push(event);
  return event;
}

function taskSnapshot(task: StoredTask): Record<string, unknown> {
  return {
    title: task.title,
    status: task.status,
    priority: task.priority,
    ownerId: task.ownerId,
    dueDate: task.dueDate,
    description: task.description,
  };
}

function eventsToTimeline(taskId: string) {
  return timelineLog
    .filter((e) => e.taskId === taskId)
    .map((e) => ({
      time: e.createdAt,
      actor: e.actor,
      action: e.action,
      message: e.note || JSON.stringify(e.after ?? {}),
      source: e.source,
      resourceId: taskId,
    }));
}

export function getWrittenTasks(): StoredTask[] {
  return Array.from(taskStore.values());
}

export function getWrittenTask(taskId: string): StoredTask | undefined {
  return taskStore.get(taskId);
}

export function createTaskLocal(body: CreateTaskBody, user: UserContext, traceId: string) {
  const taskId = `TASK-WR-${Date.now().toString(36)}`;
  const assignee = resolveAssignee(body.assignee, user);
  const task: StoredTask = {
    taskId,
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    status: 'NEW',
    priority: body.priority ?? 'MEDIUM',
    owner: assignee.owner,
    ownerId: assignee.ownerId,
    dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
    href: `/tasks/${taskId}`,
    permissionAllowed: true,
    isMine: assignee.ownerId === user.userId,
    module: 'TASK',
    taskModule: body.module ?? 'TASK',
    relatedHoSoId: body.relatedHoSoId,
    relatedFinanceId: body.relatedFinanceId,
    source: PROJECTION_LABEL,
    timeline: [],
    files: [],
  };

  const event = appendEvent(
    taskId,
    user.displayName,
    'CREATE',
    null,
    taskSnapshot(task),
    body.note?.trim() || 'Tạo việc mới',
    traceId,
  );

  task.timeline = eventsToTimeline(taskId);
  taskStore.set(taskId, task);

  return { task, event };
}

export function updateTaskLocal(taskId: string, body: UpdateTaskBody, user: UserContext, traceId: string) {
  const existing = taskStore.get(taskId);
  if (!existing) return null;

  const before = taskSnapshot(existing);
  const assignee = body.assignee !== undefined ? resolveAssignee(body.assignee, user) : null;

  const updated: StoredTask = {
    ...existing,
    title: body.title?.trim() ?? existing.title,
    description: body.description?.trim() ?? existing.description,
    status: body.status ?? existing.status,
    priority: body.priority ?? existing.priority,
    dueDate: body.dueDate ?? existing.dueDate,
    owner: assignee?.owner ?? existing.owner,
    ownerId: assignee?.ownerId ?? existing.ownerId,
    isMine: (assignee?.ownerId ?? existing.ownerId) === user.userId,
  };

  const event = appendEvent(
    taskId,
    user.displayName,
    'UPDATE',
    before,
    taskSnapshot(updated),
    body.note?.trim() || 'Cập nhật việc',
    traceId,
  );

  updated.timeline = [...eventsToTimeline(taskId)];
  taskStore.set(taskId, updated);

  return { task: updated, event };
}

export function seedWrittenTaskFromDetail(detail: StoredTask) {
  if (!taskStore.has(detail.taskId)) {
    taskStore.set(detail.taskId, { ...detail, timeline: detail.timeline ?? [] });
  }
}
