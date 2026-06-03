import { caseTypeLabel } from './caseLifecycle';
import type { CaseReadModel, CaseReadSource } from './caseReadModelTypes';

const DISCOVERY_SOURCE_LABELS: Record<CaseReadSource, string> = {
  TASK_ANCHORED: 'Theo công việc',
  HO_SO_ANCHORED: 'Theo hồ sơ',
  FINANCE_ANCHORED: 'Theo tài chính',
  ALERT_ANCHORED: 'Theo cảnh báo',
  MANUAL_CASE_KEY: 'Mã case thủ công',
  MIXED: 'Nhiều nguồn',
};

const CASE_KEY_DISPLAY_PREFIX: Partial<Record<CaseReadSource, string>> = {
  TASK_ANCHORED: 'TASK',
  HO_SO_ANCHORED: 'HO_SO',
  FINANCE_ANCHORED: 'FINANCE',
  ALERT_ANCHORED: 'ALERT',
  MANUAL_CASE_KEY: 'CASE',
};

export function discoverySourceLabel(source: CaseReadSource): string {
  return DISCOVERY_SOURCE_LABELS[source] ?? source;
}

export function formatDiscoveryLine(source: CaseReadSource): string {
  return `${source} · ${discoverySourceLabel(source)}`;
}

function resolveWinnerSource(model: CaseReadModel): CaseReadSource {
  if (model.source !== 'MIXED') return model.source;
  const selected = model.diagnostics.discoveryCandidates?.find((c) => c.selected);
  return selected?.source ?? 'TASK_ANCHORED';
}

function winnerSourceId(model: CaseReadModel, winnerSource: CaseReadSource): string | undefined {
  const selected = model.diagnostics.discoveryCandidates?.find((c) => c.selected);
  if (selected?.anchorId?.trim()) return selected.anchorId.trim();

  const primary = model.relations.find((r) => r.role === 'PRIMARY' && r.targetType !== 'TASK');
  if (primary?.targetId?.trim()) return primary.targetId.trim();

  const taskRel = model.relations.find((r) => r.targetType === 'TASK');
  if (winnerSource === 'TASK_ANCHORED' && taskRel?.targetId?.trim()) return taskRel.targetId.trim();

  const segments = model.caseKey.split(':');
  const last = segments[segments.length - 1]?.trim();
  return last || undefined;
}

/** Operator-safe key label — never canonical OPERATIONS:TASK:… (Case Key Authority §4). */
export function formatCaseKeyDisplayLabel(model: CaseReadModel): string | undefined {
  const winnerSource = resolveWinnerSource(model);
  const sourceId = winnerSourceId(model, winnerSource);
  if (!sourceId) return undefined;

  if (winnerSource === 'MANUAL_CASE_KEY') {
    const parts = sourceId.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts.slice(1).join(':')}` : `CASE:${sourceId}`;
  }

  const prefix = CASE_KEY_DISPLAY_PREFIX[winnerSource];
  return prefix ? `${prefix}:${sourceId}` : undefined;
}

/** Short safe key for expanded view — id segment only. */
export function formatCompactSafeKeyLabel(model: CaseReadModel): string | undefined {
  const full = formatCaseKeyDisplayLabel(model);
  if (!full) return undefined;
  const idx = full.indexOf(':');
  return idx >= 0 ? full.slice(idx + 1) : full;
}

export function formatCaseIdentityLabel(model: CaseReadModel): string {
  const primary =
    model.relations.find((r) => r.role === 'PRIMARY' && r.targetType !== 'TASK') ??
    model.relations.find((r) => r.role === 'PRIMARY');

  if (primary) {
    const name = primary.label?.trim() || primary.targetId;
    return `${caseTypeLabel(model.caseType)} · ${name}`;
  }

  const title = model.title.trim();
  if (title) return `${caseTypeLabel(model.caseType)} · ${title}`;
  return caseTypeLabel(model.caseType);
}

export function formatResponsibleDisplay(model: CaseReadModel | null): string {
  const name = model?.responsibility.responsible?.displayName?.trim();
  return name || 'Chưa xác định';
}

export function formatRichRelationsSummary(model: CaseReadModel): string {
  const c = model.memorySummary.counts;
  const parts: string[] = [];

  const hoSo = model.relations.filter((r) => r.targetType === 'HO_SO');
  const finance = model.relations.filter((r) => r.targetType === 'FINANCE_TRANSACTION');
  const tasks = model.relations.filter((r) => r.targetType === 'TASK');

  const workCount = Math.max(tasks.length, c.timeline, model.workItems.length);
  if (workCount > 0) parts.push(`${workCount} việc`);

  const docCount = c.attachments + c.evidence;
  if (docCount > 0) parts.push(`${docCount} tài liệu`);

  if (hoSo.length > 0) parts.push(`${hoSo.length} hồ sơ`);

  if (finance.length > 0) parts.push(`${finance.length} giao dịch`);

  if (c.checklist > 0 && parts.length < 3) parts.push(`${c.checklist} mục checklist`);

  if (parts.length === 0) {
    if (tasks.length === 1) return '1 việc hiện tại';
    return 'Chưa có liên kết';
  }

  return parts.join(' · ');
}

/** Action-oriented relation label for operator scan (OCMS_03E). */
export function formatOperatorRelationsSummary(model: CaseReadModel): string {
  const c = model.memorySummary.counts;
  const hoSo = model.relations.filter((r) => r.targetType === 'HO_SO').length;
  const finance = model.relations.filter((r) => r.targetType === 'FINANCE_TRANSACTION').length;
  const tasks = model.relations.filter((r) => r.targetType === 'TASK').length;
  const workCount = Math.max(tasks, c.timeline, model.workItems.length);
  const docCount = c.attachments + c.evidence;

  const segments: string[] = [];
  if (workCount > 0) segments.push(workCount === 1 ? '1 việc' : `${workCount} việc`);
  if (docCount > 0) segments.push(docCount === 1 ? '1 tài liệu' : `${docCount} tài liệu`);
  if (hoSo > 0) segments.push(hoSo === 1 ? '1 hồ sơ' : `${hoSo} hồ sơ`);
  if (finance > 0) segments.push(finance === 1 ? '1 giao dịch' : `${finance} giao dịch`);

  if (segments.length === 0) return 'Chưa có liên kết';
  if (segments.length === 1 && segments[0].includes('việc')) return `${segments[0]} liên quan`;
  return `${segments.join(' · ')} liên quan`;
}

export function formatDiagnosticsStatus(model: CaseReadModel | null): string {
  if (!model) return 'Thiếu nguồn discovery';

  const issues: string[] = [];
  if (model.diagnostics.discoveryOutcome === 'NONE') {
    return 'Thiếu nguồn discovery';
  }
  if (model.diagnostics.missingRelations.length > 0) {
    issues.push('Thiếu relation');
  }
  if (model.diagnostics.missingProjections.length > 0) {
    issues.push('Thiếu projection');
  }
  for (const w of model.diagnostics.warnings.slice(0, 2)) {
    const short = w.replace(/^CASE_KEY_[A-Z_]+:\s*/i, '').trim();
    if (short && !issues.includes(short)) issues.push(short);
  }
  if (issues.length === 0 && model.diagnostics.discoveryOutcome === 'RESOLVED') {
    return 'OK';
  }
  if (issues.length === 0 && model.diagnostics.discoveryOutcome === 'PARTIAL') {
    return 'Ngữ cảnh một phầi';
  }
  return issues.join(' · ');
}

export function formatDiagnosticsSummary(model: CaseReadModel): string | undefined {
  const status = formatDiagnosticsStatus(model);
  return status === 'OK' ? undefined : status;
}
