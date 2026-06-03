/**
 * Run: npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistMultiUserSyncChecks.ts
 */

import { runChecklistMultiUserSyncChecks } from '../../apps/workboard/src/modules/task/inbox/checklist/checklistMultiUserSyncChecks';

const result = runChecklistMultiUserSyncChecks();
console.log(JSON.stringify(result, null, 2));
const failed = result.checks.filter((c) => !c.pass);
if (failed.length) {
  console.error('FAILED:', failed.map((c) => c.id).join(', '));
  process.exit(1);
}
process.exit(0);
