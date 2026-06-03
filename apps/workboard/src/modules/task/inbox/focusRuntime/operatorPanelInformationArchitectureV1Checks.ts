/**
 * PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1 — static checks.
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

export function runOperatorPanelInformationArchitectureV1Checks(): {
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
  const technical = readLocal('OperatorTechnicalPanel.tsx');
  const timeline = readLocal('OperatorPanelTimelineList.tsx');
  const authority = readRepo('00_SYSTEM_BRAIN/OPERATOR/OPERATOR_PANEL_INFORMATION_ARCHITECTURE_AUTHORITY.md');
  const adr = readRepo('00_SYSTEM_BRAIN/002_DECISIONS/ADR_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1.md');

  push('TECHNICAL_TAB', right.includes("'technical'") && right.includes('Kỹ thuật'));
  push('DETAIL_NO_TIMELINE_SECTION', !panel.includes('TIMELINE GẦN NHẤT'));
  push('DETAIL_NO_TECHNICAL', !panel.includes('Thông tin kỹ thuật') && !panel.includes('<details'));
  push('DETAIL_HAS_BUSINESS', panel.includes('TÓM TẮT NGHIỆP VỤ') && panel.includes('THAO TÁC NGHIỆP VỤ'));
  push('DETAIL_HAS_CONTACT', panel.includes('LIÊN HỆ / HỖ TRỢ'));
  push('TIMELINE_TAB_RECENT', right.includes('TIMELINE GẦN NHẤT') && right.includes('TIMELINE ĐẦY ĐỦ'));
  push('TECHNICAL_PANEL', technical.includes('KỸ THUẬT') && technical.includes('buildOperatorTechnicalMetadataRows'));
  push('TIMELINE_LIST_SHARED', right.includes('OperatorPanelTimelineList') && timeline.includes('OperatorPanelTimelineList'));
  push('TABS_PRESERVED', right.includes("'handoff'") && right.includes("'dossier'"));
  push('DEFAULT_DETAIL', right.includes("useState<FocusRightTabId>('detail')"));
  push('AUTHORITY', authority.includes('Chi tiết'));
  push('ADR', adr.includes('PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Browser tab smoke not automated');

  return {
    suite: 'PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1',
    status,
    checks,
    warnings,
  };
}
