/** Work Inbox V3 — operational runtime entities */

export interface TaskTimelineEntry {
  timelineId: string;
  taskId: string;
  eventType: string;
  eventLabel: string;
  actor: string;
  payload: string;
  createdAt: string;
  source: string;
}

export interface TaskOperationalAudit {
  auditId: string;
  traceId: string;
  taskId: string;
  action: string;
  actor: string;
  actorRole: string;
  beforeState: string;
  afterState: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface TaskAppointment {
  appointmentId: string;
  taskId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  createdBy: string;
  status: string;
  createdAt: string;
}

export interface TaskNote {
  noteId: string;
  taskId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface TaskDocument {
  documentId: string;
  taskId: string;
  title: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  source?: string;
}

export interface SopEntry {
  sop_id: string;
  code: string;
  title: string;
  category: string;
  url: string;
  active: boolean;
}

export interface FormTemplateEntry {
  template_id: string;
  title: string;
  category: string;
  url: string;
  active: boolean;
}

export interface TaskOperationalBundle {
  taskId: string;
  timeline: TaskTimelineEntry[];
  appointments: TaskAppointment[];
  notes: TaskNote[];
  documents: TaskDocument[];
  audits: Array<{ id: string; entityType: string; taskId: string; createdAt: string; payload: Record<string, unknown> }>;
}
