import { useNavigate } from 'react-router-dom';
import type { ModuleRegistryEntry, ModuleRuntimeStatus } from '@/api/contracts';
import { RUNTIME_TYPE_LABELS } from '@/runtime/moduleRegistry';
import { runtimeStatusClass } from '@/runtime/moduleRuntime';
import { planModuleLaunch, logModuleOpen } from '@/runtime/moduleLauncher';
import type { LaunchContext } from '@/runtime/moduleRuntime';

interface ModuleLaunchpadProps {
  modules: ModuleRegistryEntry[];
  statusFor?: (moduleId: string) => ModuleRuntimeStatus | undefined;
  compact?: boolean;
  title?: string;
}

export function ModuleLaunchpad({ modules, statusFor, compact, title }: ModuleLaunchpadProps) {
  const navigate = useNavigate();
  const visible = modules.filter((m) => m.moduleId !== 'HOME');

  async function openModule(mod: ModuleRegistryEntry, ctx?: LaunchContext) {
    const plan = planModuleLaunch(mod, { ...ctx, returnPath: window.location.pathname });
    void logModuleOpen(mod.moduleId, mod.openMode);

    if (plan.mode === 'navigate' && plan.path) {
      navigate(plan.path);
      return;
    }
    if (plan.mode === 'iframe' && plan.path) {
      navigate(plan.path);
      return;
    }
    if (plan.mode === 'new_tab' && plan.url) {
      window.open(plan.url, '_blank', 'noopener,noreferrer');
    }
  }

  if (compact) {
    return (
      <div className="module-launchpad-compact">
        {title && <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>}
        <div className="flex flex-wrap gap-1.5">
          {visible.map((mod) => {
            const st = statusFor?.(mod.moduleId);
            return (
              <button
                key={mod.moduleId}
                type="button"
                className="module-launch-chip"
                onClick={() => openModule(mod)}
                title={mod.description}
              >
                <span>{mod.icon}</span>
                <span>{mod.navLabel ?? mod.moduleName}</span>
                {st && (
                  <span className={`h-1.5 w-1.5 rounded-full ${runtimeStatusClass(st.connected, st.degraded)}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map((mod) => {
        const st = statusFor?.(mod.moduleId);
        return (
          <button
            key={mod.moduleId}
            type="button"
            className="module-launch-card panel p-3 text-left transition-colors hover:border-accent/30"
            onClick={() => openModule(mod)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xl">{mod.icon}</span>
              {st && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${runtimeStatusClass(st.connected, st.degraded)}`} />
                  {st.statusLabel}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-100">{mod.moduleName}</h3>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{mod.description}</p>
            <span className="mt-2 inline-block rounded border border-border/60 px-1.5 py-0.5 text-[9px] uppercase text-slate-500">
              {RUNTIME_TYPE_LABELS[mod.runtimeType] ?? mod.runtimeType}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { type LaunchContext };
