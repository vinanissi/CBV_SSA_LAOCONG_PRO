/**
 * Run: npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierAggregateChecks.ts
 */

import { runDossierAggregateChecks } from '../../apps/workboard/src/modules/task/inbox/dossier/dossierAggregateChecks';

const result = runDossierAggregateChecks();
console.log(JSON.stringify(result, null, 2));
const failed = result.checks.filter((c) => !c.pass);
if (failed.length) {
  console.error('FAILED:', failed.map((c) => c.id).join(', '));
  process.exit(1);
}
process.exit(0);
