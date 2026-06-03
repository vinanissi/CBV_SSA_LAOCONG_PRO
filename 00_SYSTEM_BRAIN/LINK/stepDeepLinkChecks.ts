/**
 * Run: npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts
 */
import { runStepDeepLinkChecks } from '../../apps/workboard/src/modules/task/inbox/link/stepDeepLinkChecks';

const result = runStepDeepLinkChecks();
console.log(JSON.stringify(result, null, 2));
if (result.status === 'FAIL') {
  const failed = result.checks.filter((c) => !c.pass).map((c) => c.id);
  console.error(`FAILED: ${failed.join(', ')}`);
  process.exit(1);
}
