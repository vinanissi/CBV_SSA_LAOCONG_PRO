/**
 * PHASE_DOSSIER_02 — center vs right panel layout contract.
 */

export const DOSSIER_CENTER_RIGHT_LAYOUT = {
  centerPanelRole: 'checklist_work_surface' as const,
  rightPanelRole: 'dossier_evidence_view' as const,
  centerRecentDocumentsVisible: false as boolean,
  rightPanelDossierRequired: true,
  rightPanelDossierAggregatesTaskAttachments: true,
  rightPanelDossierAggregatesChecklistAttachments: true,
  rightPanelDossierAggregatesChecklistLinks: true,
  rightPanelDossierAggregatesChecklistFeedback: true,
};

const CENTER_PREVIEW_LS_KEY = 'cbv-dossier-center-attachments-preview:v1';

function viteCenterPreviewFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_DOSSIER_CENTER_ATTACHMENTS_PREVIEW;
  } catch {
    return undefined;
  }
}

/** Rollback: set localStorage key or VITE_DOSSIER_CENTER_ATTACHMENTS_PREVIEW=true */
export function isCenterRecentDocumentsVisible(): boolean {
  const flag = viteCenterPreviewFlag();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(CENTER_PREVIEW_LS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function validateDossierCenterRightLayout(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  layout: typeof DOSSIER_CENTER_RIGHT_LAYOUT;
  warnings: string[];
  nextStep: string;
} {
  const warnings: string[] = [];
  if (isCenterRecentDocumentsVisible()) {
    warnings.push('Center recent documents preview enabled via flag (rollback mode)');
  }
  return {
    ok: true,
    status: warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    layout: {
      ...DOSSIER_CENTER_RIGHT_LAYOUT,
      centerRecentDocumentsVisible: isCenterRecentDocumentsVisible(),
    },
    warnings,
    nextStep: 'PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING',
  };
}
