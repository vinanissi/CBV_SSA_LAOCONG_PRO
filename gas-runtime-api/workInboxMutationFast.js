/**
 * PHASE_WORK_INBOX_LATENCY_P0_FIX — minimal taskPatch helpers (no duplicate mutation entrypoints).
 */

function taskDbMapMinimalTaskPatch_(rec, patch, userMap) {
  var merged = {};
  var k;
  for (k in rec) {
    if (Object.prototype.hasOwnProperty.call(rec, k)) merged[k] = rec[k];
  }
  if (patch) {
    Object.keys(patch).forEach(function (col) {
      merged[col] = patch[col];
    });
  }
  userMap = userMap || {};
  var task = taskDbMapTaskSummaryRow_(merged, userMap);
  task.description = String(merged.DESCRIPTION || task.description || '');
  task.reporterId = taskDbNormalizeUserCode_(merged.REPORTER_ID || merged.reporterId || '');
  task.donViId = String(merged.DON_VI_ID || '');
  task.blockReason = String(merged.PENDING_ACTION || task.blockReason || '');
  task.isPrivate =
    String(merged.IS_PRIVATE || '').toLowerCase() === 'true' || merged.IS_PRIVATE === true;
  task.href = task.href || '/inbox/' + encodeURIComponent(task.taskId);
  return typeof taskDbEnrichTaskUserFields_ === 'function'
    ? taskDbEnrichTaskUserFields_(task, userMap)
    : task;
}

function taskDbCombinedMutationOpts_() {
  return {
    combinedAction: true,
    minimalPatch: true,
    skipSnapshotCacheInvalidate: true,
    skipDetailCacheInvalidate: true,
    skipCbvAudit: true,
    skipUpdateLog: true,
    userMap: {},
  };
}

function taskDbMarkMinimalPatchUsed_() {
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('fallbackMinimalPatchUsed', 1);
}

function taskDbMarkFullPatchFallback_() {
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('fullPatchFallbackUsed', 1);
}

function taskDbMapMinimalTaskPatchSlim_(task) {
  if (!task) return null;
  return {
    taskId: task.taskId,
    taskCode: task.taskCode,
    title: task.title,
    status: task.status,
    displayStatus: task.displayStatus,
    priority: task.priority,
    owner: task.owner,
    ownerId: task.ownerId,
    displayOwner: task.displayOwner,
    updatedAt: task.updatedAt,
    pendingAction: task.pendingAction,
    slaStatus: task.slaStatus,
    href: task.href,
    permissionAllowed: task.permissionAllowed !== false,
  };
}

function taskDbBuildMutationTaskPatch_(found, patch, opts) {
  opts = opts || {};
  var mapStart = Date.now();
  var task;
  if (opts.minimalPatch && typeof taskDbMapMinimalTaskPatch_ === 'function') {
    task = taskDbMapMinimalTaskPatch_(found.record, null, opts.userMap || {});
    if (opts.slimPatch !== false && typeof taskDbMapMinimalTaskPatchSlim_ === 'function') {
      task = taskDbMapMinimalTaskPatchSlim_(task);
    }
    taskDbMarkMinimalPatchUsed_();
  } else {
    task = taskDbMapTaskRow_(found.record, taskDbGetUserMap_());
    taskDbMarkFullPatchFallback_();
  }
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationResponsePatchMs', Date.now() - mapStart);
  return task;
}
