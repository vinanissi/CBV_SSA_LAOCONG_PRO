/**
 * Run: npx tsx 00_SYSTEM_BRAIN/SHEET_RUNTIME/sheetRuntimeLatencyWarningFixChecks.ts
 */
import { runSheetRuntimeLatencyWarningFixChecks } from '../../apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks';

const result = runSheetRuntimeLatencyWarningFixChecks();
console.log(JSON.stringify(result, null, 2));
if (result.status === 'FAIL') {
  const failed = result.checks.filter((c) => !c.pass).map((c) => c.id);
  console.error(`FAILED: ${failed.join(', ')}`);
  process.exit(1);
}

