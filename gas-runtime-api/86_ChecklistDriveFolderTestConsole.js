/**
 * PHASE_CHECKLIST_10 — Test console for checklist Drive folder bootstrap.
 */

function CBV_TCS_CHECKLIST_10_bootstrapDriveFoldersDryRun() {
  var report = bootstrapChecklistDriveFolders({ dryRun: true });
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_10_bootstrapDriveRoot() {
  var report = bootstrapChecklistDriveFolders({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_10_bootstrapDriveTaskItem(taskId, checklistItemId) {
  var report = bootstrapChecklistDriveFolders({
    taskId: taskId,
    checklistItemId: checklistItemId,
  });
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_10_validateDriveFolders(taskId, checklistItemId) {
  var opts = {};
  if (taskId) opts.taskId = taskId;
  if (checklistItemId) opts.checklistItemId = checklistItemId;
  var report = validateChecklistDriveFolders(opts);
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}
