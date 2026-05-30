import type { ApiEnvelope } from '@/api/contracts';

export type RuntimeFeedbackState =
  | 'idle'
  | 'pending'
  | 'success'
  | 'error'
  | 'degraded'
  | 'disabled'
  | 'empty';

export type RuntimeFeedbackSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface RuntimeFeedback {
  state: RuntimeFeedbackState;
  severity: RuntimeFeedbackSeverity;
  message: string;
  detail?: string;
  traceId?: string;
  retryLabel?: string;
  retry?: () => void;
  source?: string;
}

export const IDLE_FEEDBACK: RuntimeFeedback = {
  state: 'idle',
  severity: 'info',
  message: '',
};

export function feedbackKey(taskId: string, action: string): string {
  return `${taskId}:${action}`;
}

export function pendingFeedback(message: string, source?: string): RuntimeFeedback {
  return { state: 'pending', severity: 'info', message, source };
}

export function successFeedback(message: string, source?: string): RuntimeFeedback {
  return { state: 'success', severity: 'success', message, source };
}

export function errorFeedback(
  message: string,
  options?: { detail?: string; traceId?: string; retry?: () => void; retryLabel?: string; source?: string },
): RuntimeFeedback {
  return {
    state: 'error',
    severity: 'error',
    message,
    detail: options?.detail,
    traceId: options?.traceId,
    retry: options?.retry,
    retryLabel: options?.retryLabel ?? 'Thử lại',
    source: options?.source,
  };
}

export function degradedFeedback(message: string, options?: { detail?: string; retry?: () => void; source?: string }): RuntimeFeedback {
  return {
    state: 'degraded',
    severity: 'warning',
    message,
    detail: options?.detail,
    retry: options?.retry,
    retryLabel: options?.retry ? 'Thử lại' : undefined,
    source: options?.source,
  };
}

export function disabledFeedback(message: string, source?: string): RuntimeFeedback {
  return { state: 'disabled', severity: 'info', message, source };
}

export function feedbackFromApiEnvelope<T>(
  res: ApiEnvelope<T>,
  fallbackMessage: string,
  options?: { retry?: () => void; source?: string },
): RuntimeFeedback {
  return errorFeedback(res.errors[0] ?? fallbackMessage, {
    traceId: res.traceId,
    retry: options?.retry,
    source: options?.source,
  });
}

export function isActiveFeedback(fb: RuntimeFeedback | undefined): boolean {
  if (!fb) return false;
  return fb.state !== 'idle';
}

export function feedbackRole(severity: RuntimeFeedbackSeverity): 'status' | 'alert' {
  return severity === 'error' || severity === 'critical' ? 'alert' : 'status';
}

/** Auto-clear success feedback after delay (ms). */
export const SUCCESS_AUTO_CLEAR_MS = 4000;
