/**
 * PHASE_CHECKLIST_12 — static local runtime migration checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistLocalRuntimeMigrationChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const mig = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistLocalRuntimeMigration.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_LOCAL_RUNTIME_MIGRATION_CONTRACT.md');
  const gas = readRepo('gas-runtime-api/54_ChecklistLocalRuntimeMigration.js');
  const panel = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistMigrationPanel.tsx');

  push('INSPECT_FN', mig.includes('inspectLocalRuntime'));
  push('EXPORT_FN', mig.includes('exportLocalRuntime') && mig.includes('downloadMigrationExport'));
  push('DRY_RUN_FN', mig.includes('dryRunLocalToSheetDriveMigration'));
  push('COMMIT_GUARD', mig.includes('commitConfirmed must be true'));
  push('DUPLICATE_SKIP', mig.includes('skip_duplicate'));
  push('NO_LOCAL_CLEAR', !mig.includes('localStorage.removeItem') && !mig.includes('clearLocal'));
  push('USES_BRIDGE', mig.includes('bridgeAppendFeedback'));
  push('CONTRACT_DOC', contract.includes('commitConfirmed'));
  push('GAS_VALIDATE', gas.includes('validateChecklistLocalRuntimeMigration'));
  push('UI_PANEL', panel.includes('Dry-run') && panel.includes('Commit migration'));
  push('NO_AUTO_MIGRATE', !readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx').includes('commitLocalToSheetDriveMigration'));
  push('BRIDGE_LAYOUT', readRepo('gas-runtime-api/53_ChecklistSheetDriveBridge.js').includes('upsertLayoutState'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live migration requires Worker + bridge enabled — not run in CI');
  warnings.push('localStorage is not cleared after commit by design');

  return { suite: 'PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION', status, checks, warnings };
}
