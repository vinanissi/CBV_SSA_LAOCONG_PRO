export type ExecutionLogKind = 'INLINE_ACTION' | 'INLINE_HANDOFF' | 'MICRO_UPDATE' | 'STATUS';

const LOG_KEY = 'cbv_execution_log';

export interface ExecutionLogEntry {
  at: string;
  taskId: string;
  kind: ExecutionLogKind;
  action: string;
  meta?: string;
}

export function appendExecutionLog(entry: Omit<ExecutionLogEntry, 'at'>): void {
  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    const list: ExecutionLogEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, at: new Date().toISOString() });
    sessionStorage.setItem(LOG_KEY, JSON.stringify(list.slice(-100)));
  } catch {
    // ignore
  }
}

export function getExecutionLog(taskId?: string): ExecutionLogEntry[] {
  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    const list: ExecutionLogEntry[] = raw ? JSON.parse(raw) : [];
    return taskId ? list.filter((e) => e.taskId === taskId) : list;
  } catch {
    return [];
  }
}

export function formatInlineActionNote(action: string, meta?: string): string {
  return meta ? `[INLINE_ACTION] ${action} ${meta}` : `[INLINE_ACTION] ${action}`;
}

export function formatHandoffNote(from: string, target: string): string {
  return `[INLINE_HANDOFF] ${from} → ${target}`;
}

export interface InlineExecutionResult {
  ok: boolean;
  needsMicroUpdate?: boolean;
  needsHandoffPicker?: boolean;
  actionType?: string;
}
