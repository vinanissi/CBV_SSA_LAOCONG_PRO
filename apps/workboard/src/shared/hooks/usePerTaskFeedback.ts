import { useCallback, useRef, useState } from 'react';
import {
  type RuntimeFeedback,
  IDLE_FEEDBACK,
  feedbackKey,
  pendingFeedback,
  successFeedback,
  errorFeedback,
  SUCCESS_AUTO_CLEAR_MS,
} from '@/shared/utils/runtimeFeedback';

export function usePerTaskFeedback() {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, RuntimeFeedback>>({});
  const [pendingSet, setPendingSet] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((key: string) => {
    const id = timersRef.current.get(key);
    if (id != null) {
      window.clearTimeout(id);
      timersRef.current.delete(key);
    }
  }, []);

  const setFeedback = useCallback(
    (taskId: string, action: string, feedback: RuntimeFeedback, autoClearSuccess = true) => {
      const key = feedbackKey(taskId, action);
      clearTimer(key);
      setFeedbackMap((prev) => ({ ...prev, [key]: feedback }));
      if (feedback.state === 'success' && autoClearSuccess) {
        const id = window.setTimeout(() => {
          setFeedbackMap((prev) => {
            const next = { ...prev };
            if (next[key]?.state === 'success') delete next[key];
            return next;
          });
          timersRef.current.delete(key);
        }, SUCCESS_AUTO_CLEAR_MS);
        timersRef.current.set(key, id);
      }
    },
    [clearTimer],
  );

  const clearFeedback = useCallback(
    (taskId: string, action?: string) => {
      if (action) {
        const key = feedbackKey(taskId, action);
        clearTimer(key);
        setFeedbackMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        setFeedbackMap((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(next)) {
            if (k.startsWith(`${taskId}:`)) {
              clearTimer(k);
              delete next[k];
            }
          }
          return next;
        });
      }
    },
    [clearTimer],
  );

  const isPending = useCallback(
    (taskId: string, action: string) => pendingSet.has(feedbackKey(taskId, action)),
    [pendingSet],
  );

  const getFeedback = useCallback(
    (taskId: string, action?: string): RuntimeFeedback => {
      if (action) {
        return feedbackMap[feedbackKey(taskId, action)] ?? IDLE_FEEDBACK;
      }
      const prefix = `${taskId}:`;
      const match = Object.entries(feedbackMap).find(([k]) => k.startsWith(prefix));
      return match?.[1] ?? IDLE_FEEDBACK;
    },
    [feedbackMap],
  );

  const runWithFeedback = useCallback(
    async (
      taskId: string,
      action: string,
      messages: { pending: string; success: string; error: string },
      fn: () => Promise<{ ok: boolean; error?: string; traceId?: string }>,
      options?: { retry?: () => void },
    ): Promise<boolean> => {
      const key = feedbackKey(taskId, action);
      setPendingSet((prev) => new Set(prev).add(key));
      setFeedback(taskId, action, pendingFeedback(messages.pending, action), false);

      try {
        const result = await fn();
        setPendingSet((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });

        if (result.ok) {
          setFeedback(taskId, action, successFeedback(messages.success, action));
          return true;
        }

        setFeedback(
          taskId,
          action,
          errorFeedback(result.error ?? messages.error, {
            traceId: result.traceId,
            retry: options?.retry,
            source: action,
          }),
          false,
        );
        return false;
      } catch {
        setPendingSet((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setFeedback(
          taskId,
          action,
          errorFeedback(messages.error, { retry: options?.retry, source: action }),
          false,
        );
        return false;
      }
    },
    [setFeedback],
  );

  return {
    feedbackMap,
    getFeedback,
    isPending,
    setFeedback,
    clearFeedback,
    runWithFeedback,
  };
}
