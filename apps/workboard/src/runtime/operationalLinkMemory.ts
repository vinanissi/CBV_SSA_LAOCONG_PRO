const CONTEXT_KEY = 'cbv_operational_context';
const RECENT_MODULES_KEY = 'cbv_recent_modules';
const MAX_RECENT = 5;

export interface OperationalContext {
  moduleId?: string;
  returnPath?: string;
  taskId?: string;
  hoSoId?: string;
  savedAt: string;
}

export interface RecentModuleEntry {
  moduleId: string;
  moduleName: string;
  openedAt: string;
}

export function saveOperationalContext(partial: Omit<OperationalContext, 'savedAt'>): void {
  try {
    const prev = getOperationalContext();
    const next: OperationalContext = {
      ...prev,
      ...partial,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getOperationalContext(): OperationalContext | null {
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperationalContext;
  } catch {
    return null;
  }
}

export function clearOperationalContext(): void {
  try {
    sessionStorage.removeItem(CONTEXT_KEY);
  } catch {
    // ignore
  }
}

export function pushRecentModule(entry: Omit<RecentModuleEntry, 'openedAt'>): void {
  try {
    const list = getRecentModules().filter((m) => m.moduleId !== entry.moduleId);
    list.unshift({ ...entry, openedAt: new Date().toISOString() });
    localStorage.setItem(RECENT_MODULES_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function getRecentModules(): RecentModuleEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_MODULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentModuleEntry[];
  } catch {
    return [];
  }
}
