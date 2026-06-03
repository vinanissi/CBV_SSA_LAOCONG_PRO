/**
 * PHASE_UI_CLEANUP_NEXT_TASK_SECTION — static layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCenterNextTaskBlockVisible } from './focusCenterLayoutConfig';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runFocusNextTaskSectionCleanupChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const workspace = readLocal('FocusTaskWorkspace.tsx');
  const header = readLocal('FocusHeader.tsx');
  const cards = readLocal('FocusContentCards.tsx');
  const config = readLocal('focusCenterLayoutConfig.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/UI/UI_NEXT_TASK_SECTION_CLEANUP_CONTRACT.md');

  push('CONFIG_DEFAULT_HIDDEN', config.includes('centerNextTaskBlockVisible: false'));
  push('CONFIG_FLAG_FN', config.includes('isCenterNextTaskBlockVisible'));
  push('WORKSPACE_GATED', workspace.includes('isCenterNextTaskBlockVisible'));
  push('CENTER_BLOCK_DEFAULT_OFF', !isCenterNextTaskBlockVisible());
  push('CHECKLIST_KEPT', cards.includes('WorkInboxChecklistSection'));
  push('HEADER_POSITION', header.includes('progressLabel'));
  push('HEADER_PREV', header.includes('‹ Trước'));
  push('HEADER_NEXT', header.includes('Sau ›'));
  push('HEADER_JUMP', header.includes('WorkInboxJumpToPosition'));
  push('HEADER_COMPACT_PREVIEW', workspace.includes('nextTaskPreview'));
  push('NO_TASK_MUTATION', !workspace.includes('deleteTask') && !workspace.includes('reorderQueue'));
  push('CONTRACT_DOC', contract.includes('centerNextTaskBlockVisible: false'));
  push('NEXT_CARD_PRESERVED', workspace.includes('NextTaskCard'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live focus layout not smoke-tested in CI');
  if (isCenterNextTaskBlockVisible()) {
    warnings.push('Center next-task block visible via rollback flag');
  }

  return { suite: 'PHASE_UI_CLEANUP_NEXT_TASK_SECTION', status, checks, warnings };
}
