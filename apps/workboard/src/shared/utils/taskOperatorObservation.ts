/**
 * Lightweight operator cognition observations — session/local only.
 * Append-only; no heavy analytics. GAS sheet optional via future hook.
 */

const SESSION_KEY = 'cbv_operator_obs_session';

export type OperatorObsType =
  | 'TASK_SWITCH'
  | 'TASK_REOPEN'
  | 'QUEUE_SIZE'
  | 'RAPID_SWITCH'
  | 'WARNING_OVERLOAD'
  | 'UNFINISHED_ACTION'
  | 'RESUME_FLOW'
  | 'INTERRUPTED_TASK'
  | 'SIGNAL_SATURATION'
  | 'SIGNAL_IGNORED';

export interface OperatorObsEvent {
  type: OperatorObsType;
  at: string;
  meta?: Record<string, string | number | boolean>;
}

function readSession(): OperatorObsEvent[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OperatorObsEvent[];
  } catch {
    return [];
  }
}

function appendEvent(type: OperatorObsType, meta?: Record<string, string | number | boolean>): void {
  try {
    const list = readSession();
    list.push({ type, at: new Date().toISOString(), meta });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    // ignore
  }
}

let lastSwitchAt = 0;
let lastSwitchFrom: string | null = null;

export function recordTaskSwitch(fromId: string | null, toId: string): void {
  const now = Date.now();
  if (fromId === toId) return;

  if (fromId && lastSwitchFrom === toId) {
    appendEvent('TASK_REOPEN', { fromId, toId });
  }

  if (lastSwitchAt && now - lastSwitchAt < 3000) {
    appendEvent('RAPID_SWITCH', { fromId: fromId ?? '', toId });
  }

  lastSwitchAt = now;
  lastSwitchFrom = fromId;
  appendEvent('TASK_SWITCH', { fromId: fromId ?? '', toId });
}

export function recordQueueSize(size: number): void {
  appendEvent('QUEUE_SIZE', { size });
  if (size > 80) appendEvent('WARNING_OVERLOAD', { size });
}

export function recordUnfinishedAction(taskId: string, actionType: string): void {
  appendEvent('UNFINISHED_ACTION', { taskId, actionType });
}

export function recordResumeFlow(taskId?: string): void {
  appendEvent('RESUME_FLOW', { taskId: taskId ?? '' });
}

export function recordInterruptedTask(taskId: string): void {
  appendEvent('INTERRUPTED_TASK', { taskId });
}

export function recordCoordinationWait(taskId: string, waitingType: string, hours?: number): void {
  appendEvent('UNFINISHED_ACTION', { taskId, waitingType, hours: hours ?? 0 });
}

export function recordEscalationSignal(taskId: string, level: string): void {
  appendEvent('WARNING_OVERLOAD', { taskId, level, kind: 'escalation' });
}

export function recordAbandonedAction(taskId: string, actionType: string): void {
  appendEvent('UNFINISHED_ACTION', { taskId, actionType, abandoned: true });
}

export function recordExecutionActionStarted(taskId: string, actionType: string): void {
  appendEvent('UNFINISHED_ACTION', { taskId, actionType, started: true });
}

export function recordDetailOpen(taskId: string): void {
  appendEvent('TASK_SWITCH', { taskId, kind: 'detail_open' });
}

export function recordSignalSaturation(escalationCount: number, total: number): void {
  if (total > 0 && escalationCount / total > 0.25) {
    appendEvent('SIGNAL_SATURATION', { escalationCount, total });
  }
}

export function recordSignalIgnored(taskId: string, signalKind: string): void {
  appendEvent('SIGNAL_IGNORED', { taskId, signalKind });
}

export function getOperatorObservations(): OperatorObsEvent[] {
  return readSession();
}

export function clearOperatorObservations(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
