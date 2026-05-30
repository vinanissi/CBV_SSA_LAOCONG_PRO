const RECENT_KEY = 'cbv_recent_tasks';
const MAX_RECENT = 5;

export interface RecentTaskEntry {
  taskId: string;
  title: string;
  nextActionLabel?: string;
  focusedAt: string;
  interrupted?: boolean;
}

export function pushRecentTask(entry: Omit<RecentTaskEntry, 'focusedAt'> & { interrupted?: boolean }): void {
  try {
    const list = getRecentTasks().filter((t) => t.taskId !== entry.taskId);
    list.unshift({ ...entry, focusedAt: new Date().toISOString() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function markTaskInterrupted(taskId: string): void {
  try {
    const list = getRecentTasks().map((t) =>
      t.taskId === taskId ? { ...t, interrupted: true } : t,
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getRecentTasks(): RecentTaskEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentTaskEntry[];
  } catch {
    return [];
  }
}

export function getLastWorkingTask(): RecentTaskEntry | null {
  return getRecentTasks()[0] ?? null;
}

export function clearRecentTasks(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // ignore
  }
}
