import type { Confidence, DeriveSource, LifecycleField } from './caseReadModelTypes';

const STATUS_LIFECYCLE: Record<string, { code: string; label: string }> = {
  NEW: { code: 'TRIAGE', label: 'Tiếp nhận' },
  ASSIGNED: { code: 'TRIAGE', label: 'Đã phân công' },
  IN_PROGRESS: { code: 'ACTIVE', label: 'Đang xử lý' },
  WAITING: { code: 'WAITING', label: 'Đang chờ' },
  DONE: { code: 'RESOLVED', label: 'Đã xử lý' },
  COMPLETED: { code: 'RESOLVED', label: 'Hoàn thành' },
  CANCELLED: { code: 'CLOSED', label: 'Đã hủy' },
  BLOCKED: { code: 'BLOCKED', label: 'Bị chặn' },
};

export function inferLifecycleFromTaskStatus(
  status: string | undefined,
  since?: string | null,
): LifecycleField {
  const normalized = status?.trim().toUpperCase().replace(/\s+/g, '_') ?? '';
  const mapped = STATUS_LIFECYCLE[normalized];

  if (mapped) {
    return {
      code: mapped.code,
      label: mapped.label,
      since: since ?? null,
      source: 'INFERRED',
      confidence: normalized === 'BLOCKED' ? 'HIGH' : 'MEDIUM',
    };
  }

  if (normalized.includes('WAIT')) {
    return {
      code: 'WAITING',
      label: 'Đang chờ',
      since: since ?? null,
      source: 'INFERRED',
      confidence: 'MEDIUM',
    };
  }

  if (normalized.includes('DONE') || normalized.includes('COMPLETE')) {
    return {
      code: 'RESOLVED',
      label: 'Đã xử lý',
      since: since ?? null,
      source: 'INFERRED',
      confidence: 'LOW',
    };
  }

  return {
    code: 'ACTIVE',
    label: normalized ? 'Đang xử lý' : 'Chưa xác định giai đoạn',
    since: since ?? null,
    source: 'INFERRED',
    confidence: normalized ? 'MEDIUM' : 'LOW',
  };
}

export function minConfidence(a: Confidence, b: Confidence): Confidence {
  const order: Confidence[] = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
  return order[Math.max(order.indexOf(a), order.indexOf(b))] ?? 'UNKNOWN';
}

export const CASE_TYPE_LABELS: Record<string, string> = {
  OPERATIONS: 'Vận hành',
  HO_SO: 'Hồ sơ',
  FINANCE: 'Tài chính',
  INVOICE: 'Hóa đơn',
  MEMBERSHIP: 'Xã viên',
  COMPLAINT: 'Khiếu nại',
  PROJECT: 'Dự án',
  SUPPORT: 'Hỗ trợ',
  COMPLIANCE: 'Tuân thủ',
  DOCUMENT: 'Tài liệu',
};

export function caseTypeLabel(code: string): string {
  return CASE_TYPE_LABELS[code] ?? code;
}

export function actorFromTask(
  actorId: string | undefined,
  displayName: string | undefined,
  source: DeriveSource = 'TASK_MAIN',
): { actorId: string | null; displayName: string | null; roleSource: DeriveSource; confidence: Confidence } {
  const id = actorId?.trim() || null;
  const name = displayName?.trim() || null;
  return {
    actorId: id,
    displayName: name,
    roleSource: source,
    confidence: id || name ? 'HIGH' : 'LOW',
  };
}
