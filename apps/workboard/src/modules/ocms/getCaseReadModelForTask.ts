/**
 * Stable read-model entry point for Case-Centric runtime (phase 02).
 * Task remains loader key; returns projection-only CaseRuntimeReadModel.
 */

export {
  deriveCaseRuntimeReadModel,
  type DeriveCaseRuntimeReadModelInput,
} from './deriveCaseRuntimeReadModel';

export { deriveCaseReadModel, type DeriveCaseReadModelInput } from './deriveCaseReadModel';

export type {
  CaseRuntimeReadModel,
  CaseChecklistItem,
  CaseTaskRef,
  CaseDocumentRef,
  CaseTimelineEntry,
  CaseHandoff,
  CaseRuntimeDiagnostics,
} from './caseRuntimeReadModelTypes';

import {
  deriveCaseRuntimeReadModel,
  type DeriveCaseRuntimeReadModelInput,
} from './deriveCaseRuntimeReadModel';
import type { CaseRuntimeReadModel } from './caseRuntimeReadModelTypes';

/**
 * Primary API for phases 02+ : derive Case read model for a focused task.
 * Read-only — safe to call from hooks and tests.
 */
export function getCaseReadModelForTask(
  input: DeriveCaseRuntimeReadModelInput,
): CaseRuntimeReadModel | null {
  return deriveCaseRuntimeReadModel(input);
}
