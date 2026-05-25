import type { ApiEnvelope, ApiStatus } from '../contracts';

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

export function jsonEnvelope<T>(envelope: ApiEnvelope<T>, status = 200): Response {
  return new Response(JSON.stringify(envelope), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
