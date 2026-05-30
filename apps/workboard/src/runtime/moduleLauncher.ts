import type { ModuleRegistryEntry } from '@/api/contracts';
import { buildModuleUrl, resolveOpenMode, type LaunchContext } from './moduleRuntime';
import { pushRecentModule, saveOperationalContext } from './operationalLinkMemory';
import { getAuthToken } from '@/auth/sessionStorage';
import { api } from '@/api/client';

export interface LaunchResult {
  mode: 'navigate' | 'new_tab' | 'iframe';
  path?: string;
  url?: string;
}

export function planModuleLaunch(mod: ModuleRegistryEntry, ctx?: LaunchContext): LaunchResult {
  const mode = resolveOpenMode(mod);
  const url = buildModuleUrl(mod, ctx);

  saveOperationalContext({
    moduleId: mod.moduleId,
    returnPath: ctx?.returnPath ?? window.location.pathname,
    taskId: ctx?.taskId,
    hoSoId: ctx?.hoSoId,
  });
  pushRecentModule({ moduleId: mod.moduleId, moduleName: mod.moduleName });

  switch (mode) {
    case 'INTERNAL_ROUTE':
      return { mode: 'navigate', path: url };
    case 'IFRAME':
      if (!url) return { mode: 'navigate', path: '/plugins' };
      return { mode: 'iframe', path: `/m/${mod.moduleId.toLowerCase().replace(/_/g, '-')}`, url };
    case 'EXTERNAL':
    case 'NEW_TAB':
      return { mode: 'new_tab', url: url || mod.adminUrl || mod.primaryUrl };
    default:
      return { mode: 'navigate', path: mod.primaryUrl };
  }
}

export async function logModuleOpen(moduleId: string, openMode?: string, context?: Record<string, string>): Promise<void> {
  try {
    if (api.isMockMode()) return;
    const token = getAuthToken();
    await fetch(`${api.apiBaseUrl}/api/modules/open-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ moduleId, openMode, context }),
    });
  } catch {
    // non-blocking
  }
}
