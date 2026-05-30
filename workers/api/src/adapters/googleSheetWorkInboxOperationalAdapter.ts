import type { Env, UserContext } from '../contracts';
import type {
  FormTemplateEntry,
  SopEntry,
  TaskOperationalAudit,
  TaskOperationalBundle,
  TaskTimelineEntry,
} from '../contracts/workInboxOperational';
import { callTaskDbGas, type TaskDbCallResult } from './googleSheetTaskDbAdapter';
import { createTraceId } from '../utils/envelope';

export async function gsWiOpCreateUserTask(
  env: Env,
  payload: Record<string, unknown>,
  user: UserContext,
  traceId: string,
) {
  return callTaskDbGas<import('../contracts/workInboxCreateTask').WorkInboxCreateTaskResponse>(
    env,
    'wiOpCreateUserTask',
    payload,
    user,
    traceId,
  );
}

export async function gsWiOpAppendActionAudit(
  env: Env,
  user: UserContext,
  entry: Omit<TaskOperationalAudit, 'auditId' | 'createdAt'>,
): Promise<TaskDbCallResult<{ auditId: string; server: boolean }>> {
  return callTaskDbGas(
    env,
    'wiOpAppendActionAudit',
    {
      taskId: entry.taskId,
      traceId: entry.traceId,
      action: entry.action,
      actor: entry.actor,
      actorRole: entry.actorRole,
      beforeState: entry.beforeState,
      afterState: entry.afterState,
      payload: entry.payload,
    },
    user,
    entry.traceId,
  );
}

export async function gsWiOpAppendTimeline(
  env: Env,
  user: UserContext,
  taskId: string,
  eventType: string,
  eventLabel: string,
  actor: string,
  payload: Record<string, unknown> = {},
  traceId?: string,
): Promise<TaskDbCallResult<{ timelineId: string; server: boolean }>> {
  return callTaskDbGas(
    env,
    'wiOpAppendTimeline',
    { taskId, eventType, eventLabel, actor, payload },
    user,
    traceId ?? createTraceId(),
  );
}

export async function gsWiOpGetTaskOperational(
  env: Env,
  user: UserContext,
  taskId: string,
): Promise<TaskDbCallResult<TaskOperationalBundle>> {
  return callTaskDbGas(env, 'wiOpGetTaskOperational', { taskId }, user);
}

export async function gsWiOpCreateAppointment(
  env: Env,
  user: UserContext,
  taskId: string,
  data: { title: string; description?: string; startAt?: string; endAt?: string },
): Promise<TaskDbCallResult<{ appointment: Record<string, unknown> }>> {
  return callTaskDbGas(env, 'wiOpCreateAppointment', { taskId, ...data }, user);
}

export async function gsWiOpSaveNote(
  env: Env,
  user: UserContext,
  taskId: string,
  content: string,
): Promise<TaskDbCallResult<{ note: Record<string, unknown> }>> {
  return callTaskDbGas(env, 'wiOpSaveNote', { taskId, content }, user);
}

export async function gsWiOpAddDocument(
  env: Env,
  user: UserContext,
  taskId: string,
  data: { title: string; url?: string },
): Promise<TaskDbCallResult<{ document: Record<string, unknown> }>> {
  return callTaskDbGas(env, 'wiOpAddDocument', { taskId, ...data }, user);
}

export async function gsWiOpLookupSop(
  env: Env,
  user: UserContext,
  context: { module?: string; taskType?: string; status?: string },
): Promise<TaskDbCallResult<{ sop: SopEntry | null }>> {
  return callTaskDbGas(env, 'wiOpLookupSop', context, user);
}

export async function gsWiOpListFormTemplates(
  env: Env,
  user: UserContext,
  category?: string,
): Promise<TaskDbCallResult<{ templates: FormTemplateEntry[] }>> {
  return callTaskDbGas(env, 'wiOpListFormTemplates', { category }, user);
}

export function mapGasTimeline(entries: unknown[]): TaskTimelineEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => {
    const row = e as Record<string, string>;
    return {
      timelineId: String(row.timelineId ?? row.TIMELINE_ID ?? ''),
      taskId: String(row.taskId ?? row.TASK_ID ?? ''),
      eventType: String(row.eventType ?? row.EVENT_TYPE ?? ''),
      eventLabel: String(row.eventLabel ?? row.EVENT_LABEL ?? ''),
      actor: String(row.actor ?? row.ACTOR ?? ''),
      payload: String(row.payload ?? row.PAYLOAD ?? '{}'),
      createdAt: String(row.createdAt ?? row.CREATED_AT ?? ''),
      source: String(row.source ?? 'TASK_TIMELINE'),
    };
  });
}
