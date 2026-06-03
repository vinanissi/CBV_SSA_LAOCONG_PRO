/**
 * Case-Centric Runtime Read Model deriver — read-only projection.
 * PHASE_CASE_REFACTOR_02 — wraps OCMS deriveCaseReadModel + operational slices.
 */

import type { TaskDetail } from '@/api/contracts';
import type { WorkInboxChecklistItem } from '@/modules/task/inbox/checklist/workInboxChecklistTypes';
import { deriveCaseReadModel, type DeriveCaseReadModelInput } from './deriveCaseReadModel';
import { buildRuntimeDiagnostics } from './caseReadModelDiagnostics';
import {
  collectProjectionDiagnostics,
  projectCaseContext,
  projectChecklist,
  projectDocuments,
  projectHandoff,
  projectTasks,
  projectTimeline,
  projectWorkflowState,
  resolveDisplayKey,
} from './caseReadModelProjection';
import type { CaseRuntimeReadModel } from './caseRuntimeReadModelTypes';

export interface DeriveCaseRuntimeReadModelInput extends DeriveCaseReadModelInput {
  checklistItems?: WorkInboxChecklistItem[];
  taskDetail?: TaskDetail | null;
}

/**
 * Derive full Case-Centric read model from task + optional operational bundle.
 * Does not call network APIs or mutate storage.
 */
export function deriveCaseRuntimeReadModel(
  input: DeriveCaseRuntimeReadModelInput,
): CaseRuntimeReadModel | null {
  const ocms = deriveCaseReadModel(input);
  if (!ocms || !input.task?.taskId) return null;

  const task = input.task;
  const bundle =
    input.operationalBundle?.taskId === task.taskId ? input.operationalBundle : null;

  const checklist = projectChecklist(input.checklistItems, task.taskId);
  const documents = projectDocuments(bundle, task.taskId);
  const timeline = projectTimeline(bundle, task.taskId);
  const handoff = projectHandoff(bundle, task, input.taskDetail);
  const tasks = projectTasks(task, true);

  const runtimeCodes = collectProjectionDiagnostics({
    ocms,
    task,
    checklist,
    documents,
    timeline,
    handoff,
  });

  const diagnostics = buildRuntimeDiagnostics({
    confidence: ocms.diagnostics.confidence,
    codes: runtimeCodes,
    ocmsWarnings: ocms.diagnostics.warnings,
    runtimeState: ocms.diagnostics.runtimeState,
  });

  return {
    caseId: ocms.caseKey,
    caseKey: ocms.caseKey,
    displayKey: resolveDisplayKey(ocms),
    title: ocms.title,
    caseType: ocms.caseType,
    lifecycle: ocms.lifecycle,
    workflowState: projectWorkflowState(ocms.lifecycle),
    responsibility: ocms.responsibility,
    context: projectCaseContext(task, ocms, input.taskDetail),
    checklist,
    tasks,
    documents,
    timeline,
    handoff,
    diagnostics,
    source: ocms.source,
    permissions: ocms.permissions,
    ocmsCore: ocms,
  };
}
