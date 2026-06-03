/**
 * PHASE_CHECKLIST_11 — Test console for Sheet/Drive bridge.
 */

function CBV_TCS_CHECKLIST_11_validateBridge() {
  var report = validateChecklistSheetDriveBridge({});
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function CBV_TCS_CHECKLIST_11_bridgeDryRunRead(taskId) {
  return clBridgeDispatch_('readFeedback', { taskId: taskId }, { userId: 'TEST', displayName: 'TEST' }, 'TCS11');
}

function CBV_TCS_CHECKLIST_11_ensureDriveFolder(taskId, checklistItemId) {
  return clBridgeDispatch_(
    'ensureChecklistItemDriveFolder',
    { taskId: taskId, checklistItemId: checklistItemId },
    { userId: 'TEST', displayName: 'TEST' },
    'TCS11',
  );
}
