import type { ModuleRegistryEntry, UserContext } from '@/api/contracts';
import { hasPermission } from '@/shared/utils';

export function canAccessModule(user: UserContext, mod: ModuleRegistryEntry): boolean {
  if (!mod.isEnabled) return false;
  if (user.permissions.includes('ADMIN_ALL')) return true;
  if (mod.permissionRequired && !hasPermission(user.permissions, mod.permissionRequired)) return false;
  if (mod.roleRequired.length > 0 && !mod.roleRequired.includes(user.role)) return false;
  return true;
}

export function filterModulesForUser(user: UserContext, modules: ModuleRegistryEntry[]): ModuleRegistryEntry[] {
  return modules.filter((m) => canAccessModule(user, m)).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function groupModulesByGroup(modules: ModuleRegistryEntry[]): Map<string, ModuleRegistryEntry[]> {
  const map = new Map<string, ModuleRegistryEntry[]>();
  for (const mod of modules) {
    const list = map.get(mod.moduleGroup) ?? [];
    list.push(mod);
    map.set(mod.moduleGroup, list);
  }
  return map;
}

export const MODULE_GROUP_LABELS: Record<string, string> = {
  OPERATIONS: 'Vận hành',
  REFERENCE: 'Tham chiếu',
  SETTINGS: 'Cấu hình',
};
