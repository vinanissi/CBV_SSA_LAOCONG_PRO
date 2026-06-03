/**
 * Case-Centric Runtime Read Model — phase CASE_REFACTOR_02.
 * Extends OCMS CaseReadModel (strip contract) with workspace-oriented slices.
 * Read-only projection — no persistence.
 */

import type {
  CaseReadModel,
  CaseReadSource,
  CaseTypeCode,
  Confidence,
  LifecycleField,
  PermissionsField,
  ResponsibilityField,
} from './caseReadModelTypes';

/** Canonical Case lifecycle codes (authority V1). */
export type CaseLifecycleCode =
  | 'NEW'
  | 'TRIAGE'
  | 'ACTIVE'
  | 'WAITING'
  | 'REVIEW'
  | 'BLOCKED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'REOPENED';

export interface WorkflowStateField {
  code: CaseLifecycleCode | string;
  label: string;
  source: 'LIFECYCLE' | 'TASK_STATUS' | 'INFERRED';
  confidence: Confidence;
}

export interface CaseContextField {
  summary: string | null;
  sourceTaskId: string | null;
  sourceModule: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  operationalNote: string | null;
  caseTypeLabel: string;
  discoveryLine: string | null;
}

export interface CaseChecklistItem {
  id: string;
  label: string;
  done: boolean;
  required: boolean;
  source: 'TASK_CHECKLIST';
  promoteToTaskCandidate: boolean;
  /** PHASE_CHECKLIST_01 — optional note from task checklist row */
  note?: string | null;
  responseCount?: number;
  attachmentCount?: number;
  linkCount?: number;
  updatedAt?: string | null;
}

export interface CaseTaskRef {
  taskId: string;
  title: string;
  status: string;
  owner: string | null;
  dueDate: string | null;
  source: 'TASK_MAIN';
  isFocusTask: boolean;
}

export interface CaseDocumentRef {
  documentId: string;
  title: string;
  url: string;
  type: string;
  source: 'TASK_ATTACHMENT' | 'TASK_DOCUMENT';
  linkedTaskId: string;
}

export type CaseTimelineEntryType =
  | 'TASK_UPDATE'
  | 'CHECKLIST'
  | 'DOCUMENT'
  | 'HANDOFF'
  | 'COMMENT'
  | 'WORKFLOW'
  | 'SYSTEM'
  | 'OTHER';

export interface CaseTimelineEntry {
  entryId: string;
  entryType: CaseTimelineEntryType;
  label: string;
  actor: string | null;
  at: string | null;
  source: string;
  linkedTaskId: string | null;
  appendOnly: true;
}

export interface CaseHandoff {
  currentState: string | null;
  pendingWork: string | null;
  risks: string | null;
  nextAction: string | null;
  responsiblePerson: string | null;
  requiredDocuments: string | null;
  blockerNotes: string | null;
  derivedFrom: 'TIMELINE' | 'TASK_DETAIL' | 'NONE';
}

export type CaseDiagnosticSeverity = 'OK' | 'INFO' | 'WARNING' | 'ERROR' | 'BLOCKING';

export type CaseDiagnosticCode =
  | 'MISSING_CASE_TYPE'
  | 'MISSING_RESPONSIBLE'
  | 'AMBIGUOUS_LIFECYCLE'
  | 'NO_DOCUMENTS'
  | 'NO_TIMELINE'
  | 'NO_HANDOFF'
  | 'NO_CHECKLIST'
  | 'DERIVED_FROM_TASK_ONLY'
  | 'MULTI_TASK_GROUPING_DEFERRED'
  | 'CASE_KEY_FALLBACK'
  | 'MISSING_TITLE'
  | 'LOW_CONFIDENCE';

export interface CaseRuntimeDiagnostic {
  code: CaseDiagnosticCode;
  severity: CaseDiagnosticSeverity;
  message: string;
}

export interface CaseRuntimeDiagnostics {
  confidence: Confidence;
  codes: CaseRuntimeDiagnostic[];
  warnings: string[];
  runtimeState: 'NOT_WIRED' | 'WIRED';
}

/**
 * Case-Centric read model for workspace (phase 02+).
 * `ocmsCore` preserves OCMS strip contract — do not break strip consumers.
 */
export interface CaseRuntimeReadModel {
  caseId: string;
  caseKey: string;
  displayKey: string;
  title: string;
  caseType: CaseTypeCode;
  lifecycle: LifecycleField;
  workflowState: WorkflowStateField;
  responsibility: ResponsibilityField;
  context: CaseContextField;
  checklist: CaseChecklistItem[];
  tasks: CaseTaskRef[];
  documents: CaseDocumentRef[];
  timeline: CaseTimelineEntry[];
  handoff: CaseHandoff | null;
  diagnostics: CaseRuntimeDiagnostics;
  source: CaseReadSource;
  permissions: PermissionsField;
  visibility?: { level: string };
  /** OCMS V0 contract used by Case Context Strip */
  ocmsCore: CaseReadModel;
}
