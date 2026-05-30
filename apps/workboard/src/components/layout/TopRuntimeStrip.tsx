import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { ModuleRuntimeStatus } from '@/api/contracts';
import { runtimeStatusClass } from '@/runtime/moduleRuntime';

export function TopRuntimeStrip() {
  const [statuses, setStatuses] = useState<ModuleRuntimeStatus[]>([]);
  const connected = !api.isMockMode();

  useEffect(() => {
    api.getModulesStatus().then((res) => {
      if (res.ok && res.data?.statuses) setStatuses(res.data.statuses);
    });
  }, []);

  const indicators =
    statuses.length > 0
      ? statuses.slice(0, 5).map((s) => ({
          label: s.moduleId,
          value: s.statusLabel,
          ok: s.connected && !s.degraded,
        }))
      : [
          { label: 'Worker', value: connected ? 'OK' : 'Mock', ok: connected },
          { label: 'TASK', value: connected ? 'Connected' : 'Dev', ok: connected },
        ];

  return (
    <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-border/60 bg-surface-raised/80 px-4 py-1.5 text-[11px] text-slate-500">
      {indicators.map((item) => (
        <span key={item.label} className="inline-flex shrink-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${runtimeStatusClass(item.ok, !item.ok)}`}
            aria-hidden
          />
          <span className="text-slate-500">{item.label}:</span>
          <span className={item.ok ? 'text-slate-400' : 'text-status-warn'}>{item.value}</span>
        </span>
      ))}
    </div>
  );
}
