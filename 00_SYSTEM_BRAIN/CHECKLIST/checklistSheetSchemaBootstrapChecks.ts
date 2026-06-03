/**
 * PHASE_CHECKLIST_09 — run static bootstrap contract checks.
 * Run: npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistSheetSchemaBootstrapChecks.ts
 */

import { runChecklistSheetSchemaBootstrapChecks } from '../../apps/workboard/src/modules/task/inbox/checklist/checklistSheetSchemaBootstrapChecks';

const result = runChecklistSheetSchemaBootstrapChecks();
console.log(JSON.stringify(result, null, 2));
const failed = result.checks.filter((c) => !c.pass);
if (failed.length) {
  console.error('FAILED:', failed.map((c) => c.id).join(', '));
  process.exit(1);
}
if (result.status === 'FAIL') process.exit(1);
process.exit(0);
