/**
 * Run: npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierCrossFocusChecks.ts
 */
import { runDossierCrossFocusChecks } from '../../apps/workboard/src/modules/task/inbox/dossier/dossierCrossFocusChecks';

const result = runDossierCrossFocusChecks();
console.log(JSON.stringify(result, null, 2));
if (result.status === 'FAIL') {
  const failed = result.checks.filter((c) => !c.pass).map((c) => c.id);
  console.error(`FAILED: ${failed.join(', ')}`);
  process.exit(1);
}
