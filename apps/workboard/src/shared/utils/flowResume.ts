import { getRecentTasks, type RecentTaskEntry } from './recentContext';
import { getUnfinishedActions } from './taskContinuation';
import { getRecentModules } from '@/runtime/operationalLinkMemory';
import { loadTaskWorkingContext } from './workingContext';

export interface ResumeFlowItem {
  id: string;
  kind: 'task' | 'unfinished' | 'module';
  label: string;
  sublabel?: string;
  taskId?: string;
  moduleId?: string;
  priority: number;
}

export interface ResumeFlowSnapshot {
  items: ResumeFlowItem[];
  lastTask: RecentTaskEntry | null;
  lastModule: { moduleId: string; moduleName: string } | null;
  unfinishedCount: number;
  canResume: boolean;
}

export function buildResumeFlowSnapshot(): ResumeFlowSnapshot {
  const recent = getRecentTasks();
  const unfinished = getUnfinishedActions();
  const modules = getRecentModules();
  const ctx = loadTaskWorkingContext();
  const items: ResumeFlowItem[] = [];

  for (const u of unfinished) {
    items.push({
      id: `unfinished-${u.taskId}`,
      kind: 'unfinished',
      label: u.actionLabel,
      sublabel: u.title,
      taskId: u.taskId,
      priority: 0,
    });
  }

  if (recent[0]) {
    items.push({
      id: `task-${recent[0].taskId}`,
      kind: 'task',
      label: recent[0].title,
      sublabel: recent[0].nextActionLabel,
      taskId: recent[0].taskId,
      priority: 1,
    });
  }

  for (const t of recent.slice(1, 4)) {
    items.push({
      id: `task-${t.taskId}`,
      kind: 'task',
      label: t.title,
      sublabel: t.nextActionLabel,
      taskId: t.taskId,
      priority: 2,
    });
  }

  if (modules[0]) {
    items.push({
      id: `module-${modules[0].moduleId}`,
      kind: 'module',
      label: modules[0].moduleName,
      moduleId: modules[0].moduleId,
      priority: 3,
    });
  }

  items.sort((a, b) => a.priority - b.priority);

  return {
    items: items.slice(0, 6),
    lastTask: recent[0] ?? null,
    lastModule: modules[0] ?? null,
    unfinishedCount: unfinished.length,
    canResume: Boolean(recent[0] || unfinished.length || ctx?.selectedTaskId),
  };
}
