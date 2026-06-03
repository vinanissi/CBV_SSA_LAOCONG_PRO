/**
 * PHASE_CHECKLIST_12 — migration test console.
 */

function CBV_TCS_CHECKLIST_12_validateMigration() {
  var report = validateChecklistLocalRuntimeMigration({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}
