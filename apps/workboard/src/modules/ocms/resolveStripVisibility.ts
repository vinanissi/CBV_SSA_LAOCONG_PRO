import { isOcmsCaseStripEnabled } from './ocmsFeature';
import type { CaseReadModel, StripVisibilityLevel } from './caseReadModelTypes';

export function resolveStripVisibilityLevel(model: CaseReadModel): StripVisibilityLevel {
  if (!model.permissions.canView) return 'HIDDEN';

  const { diagnostics, source, caseType } = model;
  const confidence = diagnostics.confidence;

  if (diagnostics.discoveryOutcome === 'NONE') return 'HIDDEN';

  if (confidence === 'UNKNOWN') {
    return 'MINIMAL';
  }

  if (source === 'MANUAL_CASE_KEY' && confidence === 'LOW') {
    return 'MINIMAL';
  }

  if (confidence === 'LOW') return 'MINIMAL';

  if ((caseType === 'HO_SO' || caseType === 'FINANCE') && (confidence === 'MEDIUM' || confidence === 'HIGH')) {
    return 'EXPANDED';
  }

  if (source === 'TASK_ANCHORED' && caseType === 'OPERATIONS') {
    return confidence === 'HIGH' ? 'STANDARD' : 'MINIMAL';
  }

  if (source === 'MIXED') {
    if (caseType === 'HO_SO' || caseType === 'FINANCE') {
      return confidence === 'HIGH' ? 'EXPANDED' : 'STANDARD';
    }
  }

  return 'STANDARD';
}

export function resolveStripVisibility(model: CaseReadModel | null): StripVisibilityLevel {
  if (!isOcmsCaseStripEnabled()) return 'HIDDEN';
  if (!model) return 'HIDDEN';
  return resolveStripVisibilityLevel(model);
}

export function clampExpandedForViewport(level: StripVisibilityLevel): StripVisibilityLevel {
  if (level !== 'EXPANDED') return level;
  if (typeof window !== 'undefined' && window.innerHeight < 720) return 'STANDARD';
  return level;
}
