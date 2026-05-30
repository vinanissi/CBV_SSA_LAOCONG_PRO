/**
 * In-memory operational store when GAS unavailable (dev/mock).
 */

import type {
  TaskAppointment,
  TaskDocument,
  TaskNote,
  TaskOperationalAudit,
  TaskTimelineEntry,
} from '../contracts/workInboxOperational';

const timelineByTask = new Map<string, TaskTimelineEntry[]>();
const auditByTask = new Map<string, TaskOperationalAudit[]>();
const appointmentsByTask = new Map<string, TaskAppointment[]>();
const notesByTask = new Map<string, TaskNote[]>();
const documentsByTask = new Map<string, TaskDocument[]>();

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const workInboxOperationalMemoryStore = {
  appendAudit(entry: Omit<TaskOperationalAudit, 'auditId' | 'createdAt'>): TaskOperationalAudit {
    const row: TaskOperationalAudit = {
      ...entry,
      auditId: id('AUD'),
      createdAt: new Date().toISOString(),
    };
    const list = auditByTask.get(entry.taskId) ?? [];
    list.push(row);
    auditByTask.set(entry.taskId, list.slice(-200));
    return row;
  },

  appendTimeline(entry: Omit<TaskTimelineEntry, 'timelineId' | 'createdAt' | 'source'>): TaskTimelineEntry {
    const row: TaskTimelineEntry = {
      ...entry,
      timelineId: id('TL'),
      createdAt: new Date().toISOString(),
      source: 'memory',
    };
    const list = timelineByTask.get(entry.taskId) ?? [];
    list.unshift(row);
    timelineByTask.set(entry.taskId, list.slice(0, 100));
    return row;
  },

  createAppointment(
    taskId: string,
    data: { title: string; description?: string; startAt?: string; endAt?: string },
    createdBy: string,
  ): TaskAppointment {
    const row: TaskAppointment = {
      appointmentId: id('APT'),
      taskId,
      title: data.title,
      description: data.description ?? '',
      startAt: data.startAt ?? new Date().toISOString(),
      endAt: data.endAt ?? data.startAt ?? new Date().toISOString(),
      createdBy,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };
    const list = appointmentsByTask.get(taskId) ?? [];
    list.push(row);
    appointmentsByTask.set(taskId, list);
    return row;
  },

  saveNote(taskId: string, content: string, author: string): TaskNote {
    const row: TaskNote = {
      noteId: id('NOTE'),
      taskId,
      content,
      author,
      createdAt: new Date().toISOString(),
    };
    const list = notesByTask.get(taskId) ?? [];
    list.unshift(row);
    notesByTask.set(taskId, list);
    return row;
  },

  addDocument(
    taskId: string,
    data: { title: string; url?: string },
    uploadedBy: string,
  ): TaskDocument {
    const row: TaskDocument = {
      documentId: id('DOC'),
      taskId,
      title: data.title,
      url: data.url ?? '',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      source: 'memory',
    };
    const list = documentsByTask.get(taskId) ?? [];
    list.unshift(row);
    documentsByTask.set(taskId, list);
    return row;
  },

  getBundle(taskId: string) {
    return {
      taskId,
      timeline: [...(timelineByTask.get(taskId) ?? [])],
      appointments: [...(appointmentsByTask.get(taskId) ?? [])],
      notes: [...(notesByTask.get(taskId) ?? [])],
      documents: [...(documentsByTask.get(taskId) ?? [])],
      audits: [...(auditByTask.get(taskId) ?? [])].slice(-5).reverse(),
    };
  },
};
