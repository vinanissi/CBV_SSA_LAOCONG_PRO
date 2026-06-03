/**
 * PHASE_CHECKLIST_08 — decision evidence static checks (no runtime implementation).
 * Run: npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistPersistenceDecisionChecks.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..', '..');

function read(rel: string): string {
  const path = join(root, rel);
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

function readChecklist(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runChecklistPersistenceDecisionChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const adr = read('00_SYSTEM_BRAIN/002_DECISIONS/ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md');
  const sheet = readChecklist('CHECKLIST_SHEET_PERSISTENCE_CONTRACT.md');
  const drive = readChecklist('CHECKLIST_DRIVE_PERSISTENCE_CONTRACT.md');
  const authority = readChecklist('CHECKLIST_SHEET_DRIVE_PERSISTENCE_AUTHORITY.md');
  const migration = readChecklist('CHECKLIST_LOCAL_TO_SHEET_DRIVE_MIGRATION_PLAN.md');
  const mapping = readChecklist('CHECKLIST_SHEET_DRIVE_MAPPING_NOTES.md');
  const gas = read('gas-runtime-api/49_WorkInboxChecklist.js');
  const registry = read('00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md');

  push('ADR_ACCEPTED', adr.includes('ACCEPTED') && adr.includes('Google Sheet'));
  push('DRIVE_SOT', drive.includes('Drive stores actual files') && drive.includes('OCMS_CHECKLIST_FILES'));
  push('SHEET_TASK_CHECKLIST_MAP', sheet.includes('TASK_CHECKLIST') && sheet.includes('CHECKLIST_ITEMS'));
  push('SHEET_TABS_PROPOSED', sheet.includes('CHECKLIST_HISTORY') && sheet.includes('CHECKLIST_FEEDBACK'));
  push('HISTORY_APPEND_ONLY', sheet.includes('append-only') || sheet.includes('Append-only'));
  push('MIGRATION_PLAN_PHASES', migration.includes('PHASE_CHECKLIST_09') && migration.includes('PHASE_CHECKLIST_12'));
  push('AUTHORITY_NO_WORKFLOW', authority.includes('No workflow engine'));
  push('MAPPING_LOCAL_KEYS', mapping.includes('cbv-checklist-feedback'));
  push('EXISTING_GAS_CHECKLIST', gas.includes('TASK_CHECKLIST'));
  push('NO_IMPLEMENTATION_IN_ADR', !adr.includes('phase 11 is complete'));
  push('REGISTRY_PREREQ_CHECKLIST_07', registry.includes('PHASE_CHECKLIST_07_TEMPLATE_RUNTIME'));

  const feLocal = read(
    'apps/workboard/src/modules/task/inbox/checklist/checklistFeedbackLocalStore.ts',
  );
  push('FE_LOCAL_DOCUMENTED', feLocal.includes('localStorage') && migration.includes('cbv-checklist-feedback'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Decision phase only — no Sheet tabs created, no Drive upload, no migration executed');
  warnings.push('TASK_CHECKLIST already authoritative for items; satellite tabs pending phase 09');
  warnings.push('IS_ARCHIVED column on TASK_CHECKLIST proposed but not bootstrapped yet');

  return { suite: 'PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION', status, checks, warnings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(JSON.stringify(runChecklistPersistenceDecisionChecks(), null, 2));
}
