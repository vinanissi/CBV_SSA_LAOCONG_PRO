/**
 * Case Workspace UAT — session telemetry (observation only).
 * sessionStorage only — no API, no CASE persistence.
 */

import { isCaseWorkspaceUatTelemetryEnabled } from './ocmsFeature';

const STORAGE_KEY = 'cbv_case_workspace_uat_v1';

export interface CaseWorkspaceUatMetrics {
  sessionStartedAt: string;
  workspaceImpressions: number;
  casesObserved: number;
  understandingMarkedYes: number;
  checklistUsed: number;
  documentAccessAttempts: number;
  timelineViewed: number;
  handoffViewed: number;
  taskActionAttempts: number;
  taskActionSuccess: number;
  actionBarAttempts: number;
  actionBarSuccess: number;
  operatorConfusionCount: number;
  operatorFrictionCount: number;
  frictionNotes: string[];
}

function emptyMetrics(): CaseWorkspaceUatMetrics {
  return {
    sessionStartedAt: new Date().toISOString(),
    workspaceImpressions: 0,
    casesObserved: 0,
    understandingMarkedYes: 0,
    checklistUsed: 0,
    documentAccessAttempts: 0,
    timelineViewed: 0,
    handoffViewed: 0,
    taskActionAttempts: 0,
    taskActionSuccess: 0,
    actionBarAttempts: 0,
    actionBarSuccess: 0,
    operatorConfusionCount: 0,
    operatorFrictionCount: 0,
    frictionNotes: [],
  };
}

function loadMetrics(): CaseWorkspaceUatMetrics {
  if (typeof sessionStorage === 'undefined') return emptyMetrics();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMetrics();
    return { ...emptyMetrics(), ...JSON.parse(raw) } as CaseWorkspaceUatMetrics;
  } catch {
    return emptyMetrics();
  }
}

function saveMetrics(metrics: CaseWorkspaceUatMetrics): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    /* ignore */
  }
}

function bump(mutator: (m: CaseWorkspaceUatMetrics) => void): void {
  if (!isCaseWorkspaceUatTelemetryEnabled()) return;
  const m = loadMetrics();
  mutator(m);
  saveMetrics(m);
}

export function recordCaseWorkspaceImpression(): void {
  bump((m) => {
    m.workspaceImpressions += 1;
    m.casesObserved += 1;
  });
}

export function recordCaseWorkspaceOperatorEvent(
  event:
    | 'understanding_yes'
    | 'checklist_used'
    | 'document_access'
    | 'timeline_viewed'
    | 'handoff_viewed'
    | 'task_action_attempt'
    | 'task_action_success'
    | 'action_bar_attempt'
    | 'action_bar_success'
    | 'operator_confusion'
    | 'friction',
  note?: string,
): void {
  bump((m) => {
    switch (event) {
      case 'understanding_yes':
        m.understandingMarkedYes += 1;
        break;
      case 'checklist_used':
        m.checklistUsed += 1;
        break;
      case 'document_access':
        m.documentAccessAttempts += 1;
        break;
      case 'timeline_viewed':
        m.timelineViewed += 1;
        break;
      case 'handoff_viewed':
        m.handoffViewed += 1;
        break;
      case 'task_action_attempt':
        m.taskActionAttempts += 1;
        break;
      case 'task_action_success':
        m.taskActionSuccess += 1;
        break;
      case 'action_bar_attempt':
        m.actionBarAttempts += 1;
        break;
      case 'action_bar_success':
        m.actionBarSuccess += 1;
        break;
      case 'operator_confusion':
        m.operatorConfusionCount += 1;
        break;
      case 'friction':
        m.operatorFrictionCount += 1;
        if (note?.trim()) m.frictionNotes.push(note.trim().slice(0, 200));
        break;
      default:
        break;
    }
  });
}

export function exportCaseWorkspaceUatMetricsJson(): string {
  const m = loadMetrics();
  const rates = {
    caseUnderstandingRate:
      m.casesObserved > 0
        ? Number((m.understandingMarkedYes / m.casesObserved).toFixed(4))
        : null,
    workspaceUsabilityRate:
      m.casesObserved > 0
        ? Number(
            (
              (m.checklistUsed +
                m.documentAccessAttempts +
                m.timelineViewed +
                m.handoffViewed) /
              (m.casesObserved * 4)
            ).toFixed(4),
          )
        : null,
    taskActionSuccessRate:
      m.taskActionAttempts > 0
        ? Number((m.taskActionSuccess / m.taskActionAttempts).toFixed(4))
        : null,
    checklistSuccessRate:
      m.casesObserved > 0 ? Number((m.checklistUsed / m.casesObserved).toFixed(4)) : null,
    documentAccessSuccessRate:
      m.casesObserved > 0
        ? Number((m.documentAccessAttempts / m.casesObserved).toFixed(4))
        : null,
    timelineAccessSuccessRate:
      m.casesObserved > 0 ? Number((m.timelineViewed / m.casesObserved).toFixed(4)) : null,
    handoffAccessSuccessRate:
      m.casesObserved > 0 ? Number((m.handoffViewed / m.casesObserved).toFixed(4)) : null,
    actionBarSuccessRate:
      m.actionBarAttempts > 0
        ? Number((m.actionBarSuccess / m.actionBarAttempts).toFixed(4))
        : null,
    operatorFrictionCount: m.operatorFrictionCount,
    operatorConfusionCount: m.operatorConfusionCount,
    criticalBlockerCount: null,
  };
  return JSON.stringify({ metrics: m, rates, exportedAt: new Date().toISOString() }, null, 2);
}

export function attachCaseWorkspaceUatConsoleExport(): void {
  if (typeof window === 'undefined' || !isCaseWorkspaceUatTelemetryEnabled()) return;
  (window as unknown as { __CASE_WORKSPACE_UAT_EXPORT__?: () => string }).__CASE_WORKSPACE_UAT_EXPORT__ =
    exportCaseWorkspaceUatMetricsJson;
}

export function resetCaseWorkspaceUatMetrics(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
