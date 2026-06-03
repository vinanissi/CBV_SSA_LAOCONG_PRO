function CBV_TCS_CHECKLIST_14_validateSync() {
  var report = validateChecklistMultiUserSyncRuntime({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}
