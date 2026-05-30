import type { ModuleOpenMode, ModuleRegistryEntry } from '@/api/contracts';

export interface LaunchContext {
  taskId?: string;
  hoSoId?: string;
  returnPath?: string;
}

export function buildModuleUrl(mod: ModuleRegistryEntry, ctx?: LaunchContext): string {
  const base = mod.primaryUrl || mod.mobileUrl || mod.adminUrl || '';
  if (!ctx) return base;
  const params = new URLSearchParams();
  if (ctx.taskId) params.set('taskId', ctx.taskId);
  if (ctx.hoSoId) params.set('hoSoId', ctx.hoSoId);
  if (ctx.returnPath) params.set('return', ctx.returnPath);
  const qs = params.toString();
  if (!qs) return base;
  if (base.startsWith('http')) return `${base}${base.includes('?') ? '&' : '?'}${qs}`;
  return `${base}?${qs}`;
}

export function resolveOpenMode(mod: ModuleRegistryEntry): ModuleOpenMode {
  if (mod.openMode === 'IFRAME' && !mod.primaryUrl) return 'NEW_TAB';
  return mod.openMode;
}

export function runtimeStatusClass(connected: boolean, degraded?: boolean): string {
  if (degraded || !connected) return 'bg-amber-400';
  return 'bg-status-ok/80';
}

export function runtimeStatusText(connected: boolean, label?: string): string {
  if (label) return label;
  return connected ? 'Connected' : 'Degraded';
}
