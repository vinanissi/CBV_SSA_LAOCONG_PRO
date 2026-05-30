import type { TaskOperationalBundle } from './workInboxOperationalTypes';

export const OPERATIONAL_LOAD_TIMEOUT_MS = 10_000;

export function emptyOperationalBundle(taskId: string): TaskOperationalBundle {
  return {
    taskId,
    timeline: [],
    appointments: [],
    notes: [],
    documents: [],
    audits: [],
  };
}
