import { caseTypeLabel } from './caseLifecycle';
import type { CaseContextStripView, CaseReadModel, StripVisibilityLevel } from './caseReadModelTypes';
import {
  discoverySourceLabel,
  formatCaseIdentityLabel,
  formatCaseKeyDisplayLabel,
  formatCompactSafeKeyLabel,
  formatDiagnosticsStatus,
  formatDiagnosticsSummary,
  formatDiscoveryLine,
  formatOperatorRelationsSummary,
  formatResponsibleDisplay,
  formatRichRelationsSummary,
} from './ocmsStripLabels';

function primaryRelation(model: CaseReadModel) {
  return (
    model.relations.find((r) => r.role === 'PRIMARY' && r.targetType !== 'TASK') ??
    model.relations.find((r) => r.role === 'PRIMARY')
  );
}

function targetRelation(model: CaseReadModel) {
  return model.relations.find((r) => r.role === 'TARGET' || r.targetType === 'XA_VIEN');
}

function relationHref(model: CaseReadModel, targetType: string, targetId: string): string | undefined {
  if (!model.permissions.canOpenRelated) return undefined;
  if (targetType === 'HO_SO') return `/ho-so/${encodeURIComponent(targetId)}`;
  if (targetType === 'FINANCE_TRANSACTION') return `/finance/${encodeURIComponent(targetId)}`;
  if (targetType === 'TASK') return `/inbox/${encodeURIComponent(targetId)}`;
  return undefined;
}

function applyEnrichedFields(view: CaseContextStripView, model: CaseReadModel): void {
  view.caseTitle = model.title.trim() || undefined;
  view.caseIdentityLabel = formatCaseIdentityLabel(model);
  view.safeKeyLabel = formatCaseKeyDisplayLabel(model);
  view.discoverySourceCode = model.source;
  view.discoveryLine = formatDiscoveryLine(model.source);
  view.discoverySourceLabel = discoverySourceLabel(model.source);
  view.relationsSummary = formatRichRelationsSummary(model);
  view.relationsActionLabel = formatOperatorRelationsSummary(model);
  view.responsibleDisplay = formatResponsibleDisplay(model);
  view.responsibleLabel = `Phụ trách: ${view.responsibleDisplay}`;
  view.diagnosticsStatus = formatDiagnosticsStatus(model);
  view.diagnosticsSummary = formatDiagnosticsSummary(model);
  view.visibilityLabel = view.level;
}

function applyVisibilityScope(view: CaseContextStripView, model: CaseReadModel, level: StripVisibilityLevel): void {
  view.visibilityLabel = level;

  if (level === 'MINIMAL') {
    view.caseTitle = undefined;
    view.titleLine = undefined;
    view.caseIdentityLabel = undefined;
    view.safeKeyLabel = undefined;
    view.discoveryLine = undefined;
    view.discoverySourceLabel = undefined;
    view.discoverySourceCode = undefined;
    view.relationsSummary = undefined;
    view.relationsActionLabel = undefined;
    view.responsibleDisplay = undefined;
    view.responsibleLabel = undefined;
    view.diagnosticsStatus = view.diagnosticsStatus === 'OK' ? undefined : view.diagnosticsStatus;
    view.diagnosticsSummary = view.diagnosticsStatus;
    view.primaryRelation = undefined;
    view.targetRelation = undefined;
    view.recentLines = [];
    view.reviewerLabel = undefined;
    view.resultLabel = undefined;
    return;
  }

  if (level === 'STANDARD') {
    view.safeKeyLabel = undefined;
    view.caseIdentityLabel = undefined;
    view.discoveryLine = undefined;
    view.primaryRelation = undefined;
    view.targetRelation = undefined;
    view.recentLines = [];
    view.reviewerLabel = undefined;
    return;
  }

  view.safeKeyLabel = formatCompactSafeKeyLabel(model);
}

export function buildCaseContextStripView(
  model: CaseReadModel,
  level: StripVisibilityLevel,
  options?: { focusTaskTitle?: string; operatorCollapsed?: boolean },
): CaseContextStripView | null {
  if (level === 'HIDDEN') return null;

  const focusTitle = options?.focusTaskTitle?.trim();
  const showTitle = model.title.trim() && model.title.trim() !== focusTitle;
  const primary = primaryRelation(model);
  const target = targetRelation(model);

  const warnings = [...model.diagnostics.warnings].slice(0, 2);
  if (model.diagnostics.missingRelations.length > 0 && !warnings.some((w) => w.includes('thực thể chính'))) {
    warnings.unshift('Chưa xác định thực thể chính');
  }

  if (model.caseType === 'FINANCE' && !model.permissions.canSeePrivateFields) {
    warnings.push('Một số thông tin tài chính bị ẩn.');
  }

  const recentLines: string[] = [];
  if (level === 'STANDARD' || level === 'EXPANDED') {
    const first = model.memorySummary.recent[0];
    if (first?.label) {
      recentLines.push(`Gần nhất: ${first.label}`);
    }
  }
  if (level === 'EXPANDED') {
    for (const item of model.memorySummary.recent.slice(1, 3)) {
      if (item.label) recentLines.push(item.label);
    }
  }

  const effectiveLevel =
    options?.operatorCollapsed && level === 'EXPANDED' ? ('STANDARD' as StripVisibilityLevel) : level;

  const view: CaseContextStripView = {
    level: effectiveLevel,
    caseTypeLabel: caseTypeLabel(model.caseType),
    lifecycleLabel: model.lifecycle.label,
    warnings: warnings.slice(0, 2),
    recentLines,
    collapsed: Boolean(options?.operatorCollapsed),
  };

  applyEnrichedFields(view, model);

  if (showTitle || effectiveLevel === 'STANDARD' || effectiveLevel === 'EXPANDED') {
    view.caseTitle = model.title.trim() || undefined;
  }

  applyVisibilityScope(view, model, effectiveLevel);

  if (primary && effectiveLevel === 'EXPANDED') {
    const label = primary.label || primary.targetId;
    const href = relationHref(model, primary.targetType, primary.targetId);
    view.primaryRelation = href ? { label, link: { label, href } } : { label };
  }

  if (target && effectiveLevel === 'EXPANDED') {
    const label = target.label || target.targetId;
    const href = relationHref(model, target.targetType, target.targetId);
    view.targetRelation = href ? { label, link: { label, href } } : { label };
  }

  if (effectiveLevel === 'EXPANDED' && model.result?.label) {
    view.resultLabel = model.result.label;
  } else if (
    effectiveLevel === 'STANDARD' &&
    model.caseType === 'FINANCE' &&
    model.result?.label &&
    model.permissions.canSeePrivateFields
  ) {
    view.resultLabel = model.result.label;
  }

  if (effectiveLevel === 'EXPANDED') {
    const reviewer = model.responsibility.reviewer[0];
    if (reviewer?.displayName || model.lifecycle.code === 'REVIEW') {
      view.reviewerLabel = reviewer?.displayName ? `Duyệt: ${reviewer.displayName}` : 'Duyệt: —';
    }
  }

  return view;
}

/** Flag ON but CaseReadModel cannot be derived — diagnostics only, no fake case data. */
export function buildUnavailableCaseContextStripView(options: {
  focusTaskTitle?: string;
  warnings?: string[];
}): CaseContextStripView {
  const warnings = options.warnings?.length
    ? options.warnings.slice(0, 2)
    : ['Chưa đọc được ngữ cảnh case.'];

  return {
    level: 'MINIMAL',
    caseTypeLabel: 'Vận hành',
    lifecycleLabel: 'Chưa xác định giai đoạn',
    relationsActionLabel: 'Chưa có liên kết',
    responsibleDisplay: 'Chưa xác định',
    diagnosticsStatus: warnings[0],
    visibilityLabel: 'MINIMAL',
    warnings,
    recentLines: [],
    collapsed: false,
  };
}
