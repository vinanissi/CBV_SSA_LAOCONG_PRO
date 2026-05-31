import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskOperationalBundle } from './workInboxOperationalTypes';
import { emptyOperationalBundle, OPERATIONAL_LOAD_TIMEOUT_MS } from './workInboxOperationalEmpty';
import { loadOperationalBundle, invalidateOperationalBundleResultCache } from './workInboxOperationalBundleLoader';
import type { OperationalBundleFetchReason } from './workInboxOperationalBundleTrace';

export function useWorkInboxOperationalBundle(taskId: string | null | undefined) {
  const [bundle, setBundle] = useState<TaskOperationalBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);

  const loadedTaskIdRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const bundleRef = useRef<TaskOperationalBundle | null>(null);
  bundleRef.current = bundle;

  const runLoad = useCallback(
    async (
      id: string,
      reason: OperationalBundleFetchReason,
      caller: string,
      options: { showLoading: boolean; force: boolean },
    ) => {
      if (!options.force && loadedTaskIdRef.current === id && bundleRef.current) {
        return;
      }

      if (options.force) {
        invalidateOperationalBundleResultCache(id);
      }

      generationRef.current += 1;
      const generation = generationRef.current;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (options.showLoading) setLoading(true);
      setError(null);
      setDegraded(false);

      const timeout = window.setTimeout(() => {
        if (generation === generationRef.current) setDegraded(true);
      }, OPERATIONAL_LOAD_TIMEOUT_MS);

      try {
        const { envelope, stale } = await loadOperationalBundle({
          taskId: id,
          reason,
          caller,
          signal: controller.signal,
          force: options.force,
          requestGroup:
            reason === 'ACTION_REFRESH'
              ? 'action'
              : reason === 'MANUAL_REFRESH'
                ? 'refresh'
                : 'task_open',
        });

        if (stale || generation !== generationRef.current) return;

        if (envelope.ok && envelope.data) {
          setBundle(envelope.data);
          loadedTaskIdRef.current = id;
          setDegraded(false);
        } else {
          const msg = envelope.errors[0] ?? 'Không tải được dữ liệu vận hành';
          setError(msg);
          if (loadedTaskIdRef.current !== id) {
            setBundle(emptyOperationalBundle(id));
          }
        }
      } catch {
        if (generation !== generationRef.current) return;
        setError('Không kết nối được API vận hành');
        if (loadedTaskIdRef.current !== id) {
          setBundle(emptyOperationalBundle(id));
        }
      } finally {
        window.clearTimeout(timeout);
        if (generation === generationRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const runLoadRef = useRef(runLoad);
  runLoadRef.current = runLoad;

  useEffect(() => {
    const id = taskId?.trim() || null;
    if (!id) {
      abortRef.current?.abort();
      loadedTaskIdRef.current = null;
      setBundle(null);
      setLoading(false);
      setError(null);
      setDegraded(false);
      return;
    }

    if (loadedTaskIdRef.current === id && bundleRef.current) {
      return;
    }

    void runLoadRef.current(id, 'TASK_SELECT', 'useWorkInboxOperationalBundle.effect', {
      showLoading: true,
      force: false,
    });

    return () => {
      abortRef.current?.abort();
    };
  }, [taskId]);

  const refresh = useCallback(() => {
    const id = taskId?.trim();
    if (!id) return;
    void runLoadRef.current(id, 'MANUAL_REFRESH', 'refreshOperational', {
      showLoading: false,
      force: true,
    });
  }, [taskId]);

  const refreshForAction = useCallback(() => {
    const id = taskId?.trim();
    if (!id) return;
    void runLoadRef.current(id, 'ACTION_REFRESH', 'applyWorkInboxRefreshPlan', {
      showLoading: false,
      force: true,
    });
  }, [taskId]);

  return { bundle, loading, error, degraded, refresh, refreshForAction };
};
