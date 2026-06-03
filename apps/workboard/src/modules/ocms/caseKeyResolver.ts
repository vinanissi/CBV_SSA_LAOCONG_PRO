import type { CaseReadSource } from './caseReadModelTypes';

const NAMESPACE_PATTERNS: Partial<Record<CaseReadSource, (id: string) => string>> = {
  TASK_ANCHORED: (id) => `OPERATIONS:TASK:${id}`,
  HO_SO_ANCHORED: (id) => `HO_SO:${id}`,
  FINANCE_ANCHORED: (id) => `FINANCE:TX:${id}`,
  ALERT_ANCHORED: (id) => `ALERT:${id}`,
};

export function validateCanonicalCaseKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(':');
  if (parts.length < 2) return false;
  const idSegment = parts[parts.length - 1];
  return Boolean(idSegment?.trim());
}

export function hintCaseKey(source: CaseReadSource, sourceId: string | null): string {
  if (!sourceId?.trim()) return '';
  if (source === 'MANUAL_CASE_KEY') return sourceId.trim();
  const fn = NAMESPACE_PATTERNS[source];
  return fn ? fn(sourceId.trim()) : '';
}

export function resolveCaseKey(
  winnerSource: CaseReadSource,
  winnerSourceId: string,
  manualOverride?: string,
): string | null {
  if (manualOverride?.trim()) {
    const manual = manualOverride.trim();
    if (validateCanonicalCaseKey(manual)) return manual;
    return null;
  }
  const id = winnerSourceId?.trim();
  if (!id) return null;

  if (winnerSource === 'MANUAL_CASE_KEY') {
    return validateCanonicalCaseKey(id) ? id : null;
  }

  const fn = NAMESPACE_PATTERNS[winnerSource];
  if (!fn) return null;
  const key = fn(id);
  return validateCanonicalCaseKey(key) ? key : null;
}

export type CaseKeyResult =
  | { ok: true; caseKey: string; warnings: string[] }
  | { ok: false; caseKey: null; warnings: string[]; code: 'CASE_KEY_UNRESOLVED' | 'CASE_KEY_INVALID_MANUAL' | 'CASE_KEY_FALLBACK_TASK' };

export function resolveCaseKeyWithDiagnostics(
  winnerSource: CaseReadSource,
  winnerSourceId: string,
  manualOverride?: string,
  fallbackTaskId?: string,
): CaseKeyResult {
  if (manualOverride?.trim()) {
    const key = resolveCaseKey('MANUAL_CASE_KEY', manualOverride, manualOverride);
    if (key) return { ok: true, caseKey: key, warnings: [] };
    return {
      ok: false,
      caseKey: null,
      warnings: ['Mã case không hợp lệ — bỏ qua override'],
      code: 'CASE_KEY_INVALID_MANUAL',
    };
  }

  let key = resolveCaseKey(winnerSource, winnerSourceId);
  const warnings: string[] = [];

  if (!key && winnerSource !== 'TASK_ANCHORED' && fallbackTaskId?.trim()) {
    key = resolveCaseKey('TASK_ANCHORED', fallbackTaskId);
    if (key) {
      warnings.push('CASE_KEY_FALLBACK_TASK: Hồ sơ liên kết không đọc được — hiển thị theo công việc');
      return { ok: true, caseKey: key, warnings };
    }
  }

  if (key) return { ok: true, caseKey: key, warnings };

  return {
    ok: false,
    caseKey: null,
    warnings: ['CASE_KEY_UNRESOLVED: không xác định được mã case từ anchor'],
    code: 'CASE_KEY_UNRESOLVED',
  };
}
