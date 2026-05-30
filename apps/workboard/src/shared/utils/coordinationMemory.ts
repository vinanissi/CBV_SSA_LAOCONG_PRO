import type { TaskItem } from '@/api/contracts';
import { getWaitingDependency } from './coordinationRuntime';
import { buildHandoffChain, type HandoffStep } from './handoffRuntime';

const KEY = 'cbv_coordination_memory';

export interface CoordinationMemoryEntry {
  taskId: string;
  lastHandoff?: string;
  lastWaiting?: string;
  lastDependencyOwner?: string;
  handoffChain?: HandoffStep[];
  savedAt: string;
}

function readAll(): Record<string, CoordinationMemoryEntry> {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, CoordinationMemoryEntry>) : {};
  } catch {
    return {};
  }
}

export function saveCoordinationMemory(task: TaskItem, timeline: { action: string; message: string; actor: string; time: string; source: string; resourceId: string }[] = []): void {
  try {
    const waiting = getWaitingDependency(task);
    const chain = buildHandoffChain(task, timeline);
    const map = readAll();
    map[task.taskId] = {
      taskId: task.taskId,
      lastHandoff: chain.find((s) => s.kind === 'HANDOFF')?.label,
      lastWaiting: waiting?.waitingLabel,
      lastDependencyOwner: waiting?.waitingOwner,
      handoffChain: chain,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getCoordinationMemory(taskId: string): CoordinationMemoryEntry | null {
  return readAll()[taskId] ?? null;
}
