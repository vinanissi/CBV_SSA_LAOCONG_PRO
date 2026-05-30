import type { ApiEnvelope } from '@/api/contracts';
import { getActiveWorkInboxTraceId } from '../performance/workInboxPerformanceTrace';
import type { WorkInboxRefreshPolicy } from '../performance/workInboxRefreshPolicy';

const API_BASE = import.meta.env.VITE_CBV_API_BASE_URL?.trim() ?? '';

export type WorkInboxCombinedActionType =
  | 'START_PROCESSING'
  | 'PAUSE_TASK'
  | 'HANDOFF_TASK'
  | 'COMPLETE_TASK'
  | 'SAVE_NOTE'
  | 'CREATE_APPOINTMENT';

export interface WorkInboxCombinedActionResult {
  ok: boolean;
  traceId: string;
  taskId: string;
  action: string;
  taskPatch?: Record<string, unknown> | null;
  timelineEvent?: Record<string, unknown>;
  auditEvent?: Record<string, unknown>;
  operationalPatch?: Record<string, unknown> | null;
  refreshPolicy?: WorkInboxRefreshPolicy;
  combinedActionUsed?: boolean;
  errors?: string[];
}

export function isCombinedActionAvailable(): boolean {
  return Boolean(API_BASE);
}

export async function recordWorkInboxCombinedAction(body: {
  traceId: string;
  action: WorkInboxCombinedActionType;
  taskId: string;
  actor: string;
  actorRole: string;
  beforeState?: string;
  note?: string;
  payload?: Record<string, unknown>;
}): Promise<ApiEnvelope<WorkInboxCombinedActionResult>> {
  if (!API_BASE) {
    return {
      ok: false,
      status: 'FAIL',
      data: null as unknown as WorkInboxCombinedActionResult,
      warnings: ['COMBINED_ACTION_OFFLINE'],
      errors: ['Chưa cấu hình VITE_CBV_API_BASE_URL'],
      traceId: body.traceId,
    };
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const tid = getActiveWorkInboxTraceId() ?? body.traceId;
  if (tid) headers['X-CBV-Trace-Id'] = tid;

  const res = await fetch(`${API_BASE}/api/work-inbox/record-action`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, traceId: tid }),
  });

  if (!res.ok) {
    return {
      ok: false,
      status: 'FAIL',
      data: null as unknown as WorkInboxCombinedActionResult,
      warnings: [],
      errors: [`API ${res.status}`],
      traceId: tid,
    };
  }

  const envelope = (await res.json()) as ApiEnvelope<WorkInboxCombinedActionResult>;
  if (envelope.data) {
    envelope.data.combinedActionUsed = envelope.data.combinedActionUsed ?? true;
  }
  return envelope;
}

export function mapActionCodeToCombined(
  code: string,
): WorkInboxCombinedActionType | null {
  switch (code) {
    case 'ACTION_START_PROCESSING':
      return 'START_PROCESSING';
    case 'ACTION_PAUSE_TASK':
      return 'PAUSE_TASK';
    case 'ACTION_HANDOFF':
      return 'HANDOFF_TASK';
    case 'ACTION_COMPLETE_TASK':
      return 'COMPLETE_TASK';
    case 'ACTION_CREATE_APPOINTMENT':
      return 'CREATE_APPOINTMENT';
    default:
      return null;
  }
}
