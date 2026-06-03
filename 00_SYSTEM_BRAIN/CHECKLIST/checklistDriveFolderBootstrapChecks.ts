/**
 * PHASE_CHECKLIST_10 — run static Drive folder bootstrap checks.
 * Run: npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistDriveFolderBootstrapChecks.ts
 */

import { runChecklistDriveFolderBootstrapChecks } from '../../apps/workboard/src/modules/task/inbox/checklist/checklistDriveFolderBootstrapChecks';

const result = runChecklistDriveFolderBootstrapChecks();
console.log(JSON.stringify(result, null, 2));
const failed = result.checks.filter((c) => !c.pass);
if (failed.length) {
  console.error('FAILED:', failed.map((c) => c.id).join(', '));
  process.exit(1);
}
if (result.status === 'FAIL') process.exit(1);
process.exit(0);
