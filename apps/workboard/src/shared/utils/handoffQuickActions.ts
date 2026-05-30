export interface HandoffTarget {
  id: string;
  label: string;
  targetCode: string;
  status?: string;
  pendingNote?: string;
}

export const HANDOFF_QUICK_TARGETS: HandoffTarget[] = [
  { id: 'finance', label: 'Kế toán', targetCode: 'FINANCE', status: 'WAITING', pendingNote: 'Chờ kế toán xác nhận' },
  { id: 'manager', label: 'Quản lý', targetCode: 'SUPERVISOR', status: 'WAITING_APPROVAL', pendingNote: 'Chờ quản lý duyệt' },
  { id: 'customer', label: 'Khách', targetCode: 'CUSTOMER', status: 'WAITING', pendingNote: 'Chờ khách phản hồi' },
  { id: 'follow', label: 'Theo dõi', targetCode: 'FOLLOW_UP', status: 'WAITING', pendingNote: 'Theo dõi phản hồi' },
  { id: 'approval', label: 'Chờ duyệt', targetCode: 'APPROVAL', status: 'WAITING_APPROVAL', pendingNote: 'Chờ duyệt' },
];

export function getHandoffNote(fromOwner: string, target: HandoffTarget): string {
  return `[INLINE_HANDOFF] ${fromOwner || 'OPERATOR'} → ${target.targetCode}`;
}

export function getHandoffTargets(): HandoffTarget[] {
  return HANDOFF_QUICK_TARGETS;
}
