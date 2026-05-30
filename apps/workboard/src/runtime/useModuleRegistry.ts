import { useEffect, useState } from 'react';
import { getCachedModules, getCachedModulesStatus } from '@/modules/task/inbox/network/workInboxStaticRuntimeCache';
import type { ModuleRegistryEntry, ModuleRuntimeStatus, UserContext } from '@/api/contracts';
import { LOCAL_MODULE_REGISTRY } from './moduleRegistry';
import { filterModulesForUser } from './modulePermissions';

export function useModuleRegistry(user: UserContext) {
  const [modules, setModules] = useState<ModuleRegistryEntry[]>(() =>
    filterModulesForUser(user, LOCAL_MODULE_REGISTRY),
  );
  const [statuses, setStatuses] = useState<ModuleRuntimeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCachedModules(),
      getCachedModulesStatus(),
    ])
      .then(([modRes, statusRes]) => {
        if (cancelled) return;
        if (modRes.ok && modRes.data?.modules?.length) {
          setModules(filterModulesForUser(user, modRes.data.modules));
        } else {
          setModules(filterModulesForUser(user, LOCAL_MODULE_REGISTRY));
        }
        if (statusRes.ok && statusRes.data) {
          setStatuses(statusRes.data.statuses);
          setDegraded(statusRes.data.degraded);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user.userId, user.role]);

  function statusFor(moduleId: string): ModuleRuntimeStatus | undefined {
    return statuses.find((s) => s.moduleId === moduleId);
  }

  return { modules, statuses, loading, degraded, statusFor };
}
