/**
 * PHASE_OPERATOR_DENSITY_AND_ACTION_CENTER_POLISH — static checks.
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

export function runOperatorDensityAndActionCenterPolishChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('../checklist/SmartChecklistItemRow.tsx');
  const section = readLocal('../checklist/WorkInboxChecklistSection.tsx');
  const panel = readLocal('OperatorDetailPanel.tsx');
  const footer = readRepo('apps/workboard/src/components/runtime/RuntimeStatusBar.tsx');
  const sidebar = readRepo('apps/workboard/src/components/layout/OperatorMainSidebar.tsx');
  const constants = readRepo('apps/workboard/src/shared/constants/index.ts');
  const css = readRepo('apps/workboard/src/styles/index.css');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md');

  push('DENSITY_MODE_PROP', row.includes('densityMode') && row.includes('showInlineControls'));
  push('OPERATOR_DENSITY_CLASS', section.includes('work-inbox-smart-checklist--operator-density'));
  push('FOCUS_COMPLETE_STEP', section.includes('Hoàn thành bước') && section.includes('handleCompleteFocusedStep'));
  push('FOCUS_DISPLAY_TITLE', section.includes('focusedStepDisplayTitle'));
  push('BUSINESS_BEFORE_CONTACT', panel.indexOf('THAO TÁC NGHIỆP VỤ') < panel.indexOf('LIÊN HỆ / HỖ TRỢ'));
  push('STATUS_FIRST', panel.indexOf('Đổi trạng thái') < panel.indexOf('Chuyển giao'));
  push('NOTE_AFTER_BUSINESS', panel.indexOf('CẬP NHẬT XỬ LÝ') > panel.indexOf('THAO TÁC NGHIỆP VỤ'));
  push('DEADLINE_DEFERRED', panel.includes('Đổi hạn') && panel.includes('Chưa hỗ trợ'));
  push('TECH_COLLAPSED', panel.includes('<details') && panel.includes('Thông tin kỹ thuật'));
  push('FOOTER_MORE_MENU', footer.includes('runtime-footer-more-menu') && constants.includes('QUICK_BAR_MORE_IDS'));
  push('FOOTER_PRIMARY', constants.includes('QUICK_BAR_PRIMARY_IDS'));
  push('SIDEBAR_SYSTEM_COLLAPSE', sidebar.includes('operator-main-sidebar__section--system'));
  push('CSS_DENSITY', css.includes('work-inbox-smart-checklist--operator-density'));
  push('AUTHORITY_DENSITY', authority.includes('Operator density') || authority.includes('densityMode'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Visual density gain — verify scroll count in browser');
  warnings.push('Đổi hạn remains unsupported (documented)');

  return { suite: 'PHASE_OPERATOR_DENSITY_AND_ACTION_CENTER_POLISH', status, checks, warnings };
}
