import type { RuntimeFeedback } from '@/shared/utils/runtimeFeedback';
import { isActiveFeedback } from '@/shared/utils/runtimeFeedback';

interface RuntimeInlineStatusProps {
  feedback?: RuntimeFeedback | null;
}

/** Compact per-row/per-card status line for task mutations. */
export function RuntimeInlineStatus({ feedback }: RuntimeInlineStatusProps) {
  if (!feedback || !isActiveFeedback(feedback) || !feedback.message) return null;

  const stateClass =
    feedback.state === 'pending'
      ? 'runtime-inline-pending'
      : feedback.state === 'success'
        ? 'runtime-inline-success'
        : feedback.state === 'error'
          ? 'runtime-inline-error'
          : feedback.state === 'degraded'
            ? 'runtime-inline-degraded'
            : 'runtime-inline-info';

  return (
    <p className={`runtime-inline-status ${stateClass}`} role={feedback.state === 'error' ? 'alert' : 'status'}>
      {feedback.state === 'pending' && <span className="runtime-inline-dot" aria-hidden />}
      {feedback.message}
      {feedback.retry && feedback.state === 'error' && (
        <button type="button" className="runtime-inline-retry" onClick={feedback.retry}>
          {feedback.retryLabel ?? 'Thử lại'}
        </button>
      )}
    </p>
  );
}
