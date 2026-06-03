/**
 * Case Read Model diagnostics — codes, severity, no silent fallback.
 * PHASE_CASE_REFACTOR_02_CASE_READ_MODEL
 */

import type { Confidence } from './caseReadModelTypes';
import type {
  CaseDiagnosticCode,
  CaseDiagnosticSeverity,
  CaseRuntimeDiagnostic,
  CaseRuntimeDiagnostics,
} from './caseRuntimeReadModelTypes';

export function diagnosticSeverityForCode(code: CaseDiagnosticCode): CaseDiagnosticSeverity {
  switch (code) {
    case 'MISSING_RESPONSIBLE':
    case 'MISSING_TITLE':
      return 'WARNING';
    case 'AMBIGUOUS_LIFECYCLE':
    case 'LOW_CONFIDENCE':
    case 'CASE_KEY_FALLBACK':
      return 'WARNING';
    case 'NO_DOCUMENTS':
    case 'NO_TIMELINE':
    case 'NO_HANDOFF':
    case 'NO_CHECKLIST':
    case 'DERIVED_FROM_TASK_ONLY':
    case 'MULTI_TASK_GROUPING_DEFERRED':
      return 'INFO';
    case 'MISSING_CASE_TYPE':
      return 'ERROR';
    default:
      return 'INFO';
  }
}

export function makeRuntimeDiagnostic(
  code: CaseDiagnosticCode,
  message: string,
  severity?: CaseDiagnosticSeverity,
): CaseRuntimeDiagnostic {
  return {
    code,
    severity: severity ?? diagnosticSeverityForCode(code),
    message,
  };
}

export function buildRuntimeDiagnostics(options: {
  confidence: Confidence;
  codes: CaseRuntimeDiagnostic[];
  ocmsWarnings: string[];
  runtimeState?: 'NOT_WIRED' | 'WIRED';
}): CaseRuntimeDiagnostics {
  const warnings = [
    ...options.ocmsWarnings,
    ...options.codes
      .filter((c) => c.severity === 'WARNING' || c.severity === 'ERROR')
      .map((c) => c.message),
  ];
  return {
    confidence: options.confidence,
    codes: options.codes,
    warnings: [...new Set(warnings)],
    runtimeState: options.runtimeState ?? 'NOT_WIRED',
  };
}

export const DIAGNOSTIC_MESSAGES: Record<CaseDiagnosticCode, string> = {
  MISSING_CASE_TYPE: 'Không xác định loại case',
  MISSING_RESPONSIBLE: 'Chưa có người phụ trách',
  AMBIGUOUS_LIFECYCLE: 'Giai đoạn case chưa rõ (suy luận từ trạng thái công việc)',
  NO_DOCUMENTS: 'Chưa có tài liệu đính kèm',
  NO_TIMELINE: 'Chưa có lịch sử hoạt động',
  NO_HANDOFF: 'Chưa có bàn giao',
  NO_CHECKLIST: 'Chưa có checklist',
  DERIVED_FROM_TASK_ONLY: 'Case suy luận chỉ từ công việc hiện tại',
  MULTI_TASK_GROUPING_DEFERRED: 'Nhóm nhiều công việc / case — chưa hỗ trợ',
  CASE_KEY_FALLBACK: 'Dùng mã case dự phòng theo công việc',
  MISSING_TITLE: 'Thiếu tiêu đề case',
  LOW_CONFIDENCE: 'Độ tin cậy ngữ cảnh thấp',
};
