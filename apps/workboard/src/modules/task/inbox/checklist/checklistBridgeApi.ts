/**
 * PHASE_CHECKLIST_11 — Workboard client for checklist Sheet/Drive bridge.
 */

import { api } from '@/api/client';
import type {
  ChecklistBridgeMethod,
  ChecklistBridgeResult,
} from './checklistBridgeTypes';

export async function callChecklistBridge<T = unknown>(
  taskId: string,
  method: ChecklistBridgeMethod,
  payload: Record<string, unknown> = {},
): Promise<ChecklistBridgeResult<T>> {
  const envelope = await api.callWorkInboxChecklistBridge(taskId, { method, ...payload });
  if (!envelope.ok) {
    return {
      ok: false,
      status: 'FAIL',
      traceId: envelope.traceId ?? '',
      message: envelope.errors?.[0] ?? 'Bridge call failed',
      errors: envelope.errors ?? [],
      warnings: envelope.warnings ?? [],
    };
  }
  return {
    ok: true,
    status: 'GO',
    traceId: envelope.traceId ?? '',
    data: envelope.data as T,
    warnings: envelope.warnings ?? [],
    errors: [],
  };
}
