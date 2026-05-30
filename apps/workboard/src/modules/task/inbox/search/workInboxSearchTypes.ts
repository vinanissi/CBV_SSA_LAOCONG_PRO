/** PHASE_WORK_INBOX_SEARCH_RUNTIME — search result contract. */

export type WorkInboxSearchMatchType =
  | 'TASK_ID'
  | 'PERSON'
  | 'PHONE'
  | 'LICENSE'
  | 'TITLE'
  | 'CONTENT';

export interface WorkInboxSearchResult {
  taskId: string;
  title: string;
  assignee: string;
  phone?: string;
  licensePlate?: string;
  status: string;
  position: number;
  matchType: WorkInboxSearchMatchType;
  score: number;
}

export const WORK_INBOX_SEARCH_DEBOUNCE_MS = 250;
