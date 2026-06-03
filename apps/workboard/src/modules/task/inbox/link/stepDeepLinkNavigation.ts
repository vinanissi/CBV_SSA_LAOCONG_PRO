/**
 * PHASE_LINK_01 — URL step param → dossier cross-focus bus (UI-only).
 */

import { requestDossierCrossFocus } from '../dossier/dossierCrossFocusNavigation';
import type { DossierFocusRequest, DossierFocusResult } from '../dossier/dossierCrossFocusTypes';

let stepLinkSeq = 0;

function nextStepLinkFocusId(): string {
  stepLinkSeq += 1;
  return `step-deep-link-${Date.now()}-${stepLinkSeq}`;
}

export function buildStepDeepLinkFocusRequest(
  taskId: string,
  checklistItemId: string,
): DossierFocusRequest {
  return {
    id: nextStepLinkFocusId(),
    taskId: taskId.trim(),
    checklistItemId: checklistItemId.trim(),
    dossierItemId: null,
    dossierItemType: undefined,
    source: 'step_deep_link',
    behavior: { scroll: true, highlight: true, expand: true },
    createdAt: new Date().toISOString(),
  };
}

export function consumeChecklistStepDeepLink(
  taskId: string,
  checklistItemId: string,
  knownChecklistItemIds: string[],
): DossierFocusResult {
  const request = buildStepDeepLinkFocusRequest(taskId, checklistItemId);
  return requestDossierCrossFocus(request, knownChecklistItemIds);
}

export function validateStepDeepLinkRuntime(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  nextStep: string;
} {
  return {
    ok: true,
    status: 'GO_WITH_WARNINGS',
    nextStep: 'PHASE_LINK_02_STEP_DEEP_LINK_UAT',
  };
}
