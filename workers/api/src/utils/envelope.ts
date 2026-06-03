import type { Env } from '../contracts';
import type { ApiEnvelope, ApiStatus } from '../contracts';
import type { WorkInboxPerformanceTraceEnvelope } from '../modules/workInboxPerformanceTrace';
import { withCors } from '../cors';

/** JSON body: standard ApiEnvelope fields; optional performanceTrace from work-inbox routes. */
export type ApiEnvelopeWire<T = unknown> = ApiEnvelope<T> & {
  performanceTrace?: WorkInboxPerformanceTraceEnvelope;
};

export type ApiEnvelopeWithPerf<T> = ApiEnvelope<T> & {
  performanceTrace: WorkInboxPerformanceTraceEnvelope;
};

export function createTraceId(): string {
  return `cbv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEnvelope<T>(
  data: T,
  options?: {
    warnings?: string[];
    errors?: string[];
    ok?: boolean;
    status?: ApiStatus;
    traceId?: string;
  },
): ApiEnvelope<T> {
  const warnings = options?.warnings ?? [];
  const errors = options?.errors ?? [];
  const ok = options?.ok ?? errors.length === 0;
  const status =
    options?.status ?? (errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');

  return {
    ok,
    status,
    data,
    warnings,
    errors,
    traceId: options?.traceId ?? createTraceId(),
  };
}

export function jsonEnvelope<T>(envelope: ApiEnvelopeWire<T>, status = 200): Response {
  return new Response(JSON.stringify(envelope), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** HTTP status from envelope ok/errors (preserves existing router semantics). */
export function resolveHttpStatus(envelope: Pick<ApiEnvelope<unknown>, 'ok' | 'errors'>): number {
  if (envelope.ok) return 200;
  if (envelope.errors.some((e) => e.includes('Không có quyền'))) return 403;
  if (envelope.errors.some((e) => e.includes('Chưa đăng nhập'))) return 401;
  if (
    envelope.errors.some(
      (e) =>
        e.includes('Role không hợp lệ') ||
        e.includes('Thiếu tham số') ||
        e.includes('không hợp lệ') ||
        e.includes('Không được cập nhật') ||
        e.includes('Body JSON'),
    )
  ) {
    return 400;
  }
  if (envelope.errors.some((e) => e.includes('Không tìm thấy'))) return 404;
  if (envelope.errors.some((e) => e.includes('Chức năng ghi chưa được bật'))) return 423;
  return 400;
}

export function corsJsonResponse(
  request: Request,
  env: Env,
  envelope: ApiEnvelopeWire<unknown>,
  httpStatus?: number,
): Response {
  return withCors(jsonEnvelope(envelope, httpStatus ?? resolveHttpStatus(envelope)), request, env);
}

export function attachPerformanceTrace<T>(
  envelope: ApiEnvelope<T>,
  perf: WorkInboxPerformanceTraceEnvelope,
): ApiEnvelopeWithPerf<T> {
  return { ...envelope, performanceTrace: perf };
}
