/**
 * PHASE_CHECKLIST_MIGRATION_TOOL_DEV_ONLY — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');
const readLocal = (name: string) => readFileSync(join(__dir, name), 'utf8');

const section = readLocal('WorkInboxChecklistSection.tsx');
const panel = readLocal('ChecklistMigrationPanel.tsx');
const access = readRepo('apps/workboard/src/shared/utils/checklistMigrationToolAccess.ts');
const mig = readLocal('checklistLocalRuntimeMigration.ts');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_MIGRATION_TOOL_AUTHORITY.md');
const envExample = readRepo('apps/workboard/.env.example');

const checks = [
  { id: 'ACCESS_HELPER', pass: access.includes('canShowChecklistMigrationTools') },
  { id: 'THREE_FLAGS', pass: access.includes('VITE_CBV_DEV_MODE') && access.includes('VITE_CBV_ADMIN_TOOLS_ENABLED') },
  { id: 'SECTION_GATED', pass: section.includes('canShowChecklistMigrationTools()') },
  { id: 'PANEL_DEFENSE', pass: panel.includes('canShowChecklistMigrationTools()') },
  { id: 'COMMIT_GUARD', pass: mig.includes('commitConfirmed must be true') },
  { id: 'NO_AUTO_COMMIT', pass: !section.includes('commitLocalToSheetDriveMigration') },
  { id: 'NO_LOCAL_CLEAR', pass: !mig.includes('localStorage.removeItem') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('Operator runtime MUST NOT') },
  { id: 'ENV_DOCUMENTED', pass: envExample.includes('VITE_CBV_ADMIN_TOOLS_ENABLED') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_MIGRATION_TOOL_DEV_ONLY', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
