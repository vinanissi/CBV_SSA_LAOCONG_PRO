/**
 * PHASE_OPERATOR_DETAIL_PANEL_APPSHEET_LIKE_ACTIONS — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runOperatorDetailPanelAppsheetLikeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const right = readLocal('RightContextTabs.tsx');
  const panel = readLocal('OperatorDetailPanel.tsx');
  const model = readLocal('focusOperatorDetailModel.ts');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md');

  push('OPERATOR_PANEL', right.includes('OperatorDetailPanel'));
  push('NO_CENTER_MA_VIEC', !panel.includes('Mã việc') || panel.includes('technical'));
  push(
    'TECHNICAL_ISOLATED',
    (!panel.includes('Thông tin kỹ thuật') && right.includes("'technical'")) ||
      (panel.includes('Thông tin kỹ thuật') && panel.includes('<details')),
  );
  push('SUMMARY_ROWS', model.includes('buildOperatorDetailSummaryRows'));
  push('TECH_ROWS', model.includes('buildOperatorTechnicalMetadataRows'));
  push('CONG_VIEC_LABEL', model.includes("label: 'Công việc'") || panel.includes('TÓM TẮT NGHIỆP VỤ'));
  push('CHUYEN_GIAO', panel.includes('Chuyển giao'));
  push('DOI_HAN_DEFERRED', panel.includes('Đổi hạn') && panel.includes('Chưa hỗ trợ'));
  push('LUU_CAP_NHAT', panel.includes('Lưu cập nhật'));
  push(
    'TABS_KEPT',
    right.includes("'timeline'") &&
      right.includes("'handoff'") &&
      right.includes("'dossier'") &&
      right.includes("'technical'"),
  );
  push('AUTHORITY', authority.includes('AppSheet-like') || authority.includes('technical IDs'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('DPA browser suite required');

  return { suite: 'PHASE_OPERATOR_DETAIL_PANEL_APPSHEET_LIKE_ACTIONS', status, checks, warnings };
}
