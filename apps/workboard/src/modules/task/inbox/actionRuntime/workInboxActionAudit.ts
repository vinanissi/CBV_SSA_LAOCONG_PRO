import type { WorkInboxAuditEvent } from './workInboxActionTypes';

const AUDIT_KEY = 'cbv_work_inbox_action_audit';

export interface WorkInboxAuditEntry {
  at: string;
  taskId: string;
  action: WorkInboxAuditEvent | string;
  actor: string;
  traceId: string;
  meta?: string;
}

export function appendWorkInboxActionAudit(entry: Omit<WorkInboxAuditEntry, 'at'>): void {
  try {
    const raw = sessionStorage.getItem(AUDIT_KEY);
    const list: WorkInboxAuditEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, at: new Date().toISOString() });
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    // ignore quota
  }
}

export function getWorkInboxActionAudit(taskId?: string): WorkInboxAuditEntry[] {
  try {
    const raw = sessionStorage.getItem(AUDIT_KEY);
    const list: WorkInboxAuditEntry[] = raw ? JSON.parse(raw) : [];
    return taskId ? list.filter((e) => e.taskId === taskId) : list;
  } catch {
    return [];
  }
}
