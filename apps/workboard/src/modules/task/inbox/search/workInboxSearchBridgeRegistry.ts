/**
 * CBV-RCLA v1.1 — Work Inbox Search bridge (registry, not ad-hoc global state).
 * TasksPage / WorkInboxGroupsPanel registers; TopBar consumes when on /inbox.
 */

import type { TaskItem, UserContext } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import type { WorkInboxSearchResult } from './workInboxSearchTypes';

export interface WorkInboxSearchBridge {
  focusItems: WorkInboxFocusItem[];
  tasks: TaskItem[];
  operator: UserContext;
  enterFocus: () => void;
  openSearchResult: (result: WorkInboxSearchResult, query: string) => void;
  jumpToPosition: (position: number) => { ok: boolean; error?: string };
}

let activeBridge: WorkInboxSearchBridge | null = null;

export function registerWorkInboxSearchBridge(bridge: WorkInboxSearchBridge): void {
  activeBridge = bridge;
}

export function unregisterWorkInboxSearchBridge(): void {
  activeBridge = null;
}

export function getWorkInboxSearchBridge(): WorkInboxSearchBridge | null {
  return activeBridge;
}

/** Read-only accessor for search bridge (RCLA registry). */
export function getWorkInboxSearchBridgeOptional(): WorkInboxSearchBridge | null {
  return activeBridge;
}
