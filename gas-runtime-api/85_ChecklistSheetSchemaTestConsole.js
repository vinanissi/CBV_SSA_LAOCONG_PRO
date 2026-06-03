/**
 * PHASE_CHECKLIST_09 — Test console helpers for checklist Sheet schema bootstrap.
 */

function CBV_TCS_CHECKLIST_09_bootstrapSchema() {
  var report = bootstrapChecklistSheetSchema({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_09_validateSchema() {
  var report = validateChecklistSheetSchema({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_09_bootstrapSchemaDryRun() {
  return bootstrapChecklistSheetSchema({ dryRun: true });
}
