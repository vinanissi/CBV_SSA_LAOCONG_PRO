import type { ApiEnvelope } from '@/api/contracts';

export function createEnvelope<T>(
  data: T,
  options?: { warnings?: string[]; errors?: string[]; ok?: boolean; status?: ApiEnvelope<T>['status'] },
): ApiEnvelope<T> {
  const warnings = options?.warnings ?? [];
  const errors = options?.errors ?? [];
  const ok = options?.ok ?? errors.length === 0;
  const status =
    options?.status ??
    (errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');

  return {
    ok,
    status,
    data,
    warnings,
    errors,
    traceId: `demo-${Date.now().toString(36)}`,
  };
}

export function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes('ADMIN_ALL')) return true;
  return permissions.includes(required);
}

export function executionLabel(mode: string): string {
  const map: Record<string, string> = {
    EXECUTION_LOCKED: 'Chỉ xem trong phiên bản này',
    MANUAL_CONFIRM_REQUIRED: 'Cần xác nhận',
    NOT_CONFIGURED: 'Chưa cấu hình',
    READ_ONLY: 'Chỉ xem',
  };
  return map[mode] ?? '';
}
