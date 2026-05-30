import type { RuntimeFeedback } from '@/shared/utils/runtimeFeedback';
import { feedbackRole, isActiveFeedback } from '@/shared/utils/runtimeFeedback';

interface RuntimeFeedbackMessageProps {
  feedback?: RuntimeFeedback | null;
  className?: string;
  compact?: boolean;
}

function severityClass(severity: RuntimeFeedback['severity'], state: RuntimeFeedback['state']): string {
  if (state === 'pending') return 'runtime-feedback-pending';
  if (state === 'success') return 'runtime-feedback-success';
  if (state === 'degraded') return 'runtime-feedback-degraded';
  if (state === 'disabled') return 'runtime-feedback-disabled';
  if (state === 'empty') return 'runtime-feedback-empty';
  switch (severity) {
    case 'critical':
    case 'error':
      return 'runtime-feedback-error';
    case 'warning':
      return 'runtime-feedback-degraded';
    case 'success':
      return 'runtime-feedback-success';
    default:
      return 'runtime-feedback-info';
  }
}

export function RuntimeFeedbackMessage({ feedback, className = '', compact = false }: RuntimeFeedbackMessageProps) {
  if (!feedback || !isActiveFeedback(feedback) || !feedback.message) return null;

  const role = feedbackRole(feedback.severity);

  return (
    <div
      className={`runtime-feedback-message ${severityClass(feedback.severity, feedback.state)} ${compact ? 'runtime-feedback-compact' : ''} ${className}`}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      <span className="runtime-feedback-text">{feedback.message}</span>
      {feedback.detail && !compact && (
        <span className="runtime-feedback-detail">{feedback.detail}</span>
      )}
      {feedback.retry && feedback.retryLabel && (
        <button type="button" className="runtime-feedback-retry" onClick={feedback.retry}>
          {feedback.retryLabel}
        </button>
      )}
    </div>
  );
}
