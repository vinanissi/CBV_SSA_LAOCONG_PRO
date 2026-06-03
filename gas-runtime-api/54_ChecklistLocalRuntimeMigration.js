/**
 * PHASE_CHECKLIST_12 — validate local runtime migration readiness (GAS).
 * Browser migration runs in workboard; GAS validates bridge + optional export ingest.
 */

function validateChecklistLocalRuntimeMigration(options) {
  options = options || {};
  var traceId = typeof clBridgeTraceId_ === 'function' ? clBridgeTraceId_(options, options.traceId) : 'mig-val';
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: typeof clBridgeNowIso_ === 'function' ? clBridgeNowIso_() : new Date().toISOString(),
    traceId: traceId,
    localRuntime: { readable: true, note: 'localStorage is browser-only; use workboard export' },
    bridge: { available: typeof clBridgeDispatch_ === 'function' },
    migration: { dryRunAvailable: true, commitGuarded: true },
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME',
  };

  if (typeof validateChecklistSheetDriveBridge === 'function') {
    var bridgeVal = validateChecklistSheetDriveBridge(options);
    result.bridge.sheetDrive = bridgeVal;
    if (bridgeVal.warnings && bridgeVal.warnings.length) {
      result.warnings = result.warnings.concat(bridgeVal.warnings);
    }
    if (!bridgeVal.ok) {
      result.ok = false;
      result.status = 'FAIL';
      result.errors.push('Sheet/Drive bridge validation failed');
    }
  } else {
    result.warnings.push('validateChecklistSheetDriveBridge not loaded');
  }

  if (result.warnings.length && result.ok) {
    result.status = 'GO_WITH_WARNINGS';
  }
  return result;
}

/**
 * Migrate from exported JSON payload (operator paste / file upload to Apps Script).
 * @param {Object} payload exported payload, dryRun, commitConfirmed
 */
function clMigrateFromLocalExport_(payload, actor, traceId) {
  payload = payload || {};
  traceId = typeof clBridgeTraceId_ === 'function' ? clBridgeTraceId_(payload, traceId) : traceId;
  var dryRun = payload.dryRun === true;
  if (!dryRun && payload.commitConfirmed !== true) {
    return {
      ok: false,
      status: 'FAIL',
      traceId: traceId,
      errors: ['commitConfirmed required'],
      warnings: ['Use dryRun:true first'],
    };
  }
  var exported = payload.exported || payload.tasks;
  if (!exported || !exported.tasks) {
    return { ok: false, status: 'FAIL', traceId: traceId, errors: ['Missing exported.tasks'] };
  }

  var records = [];
  var migratedCount = 0;
  var skippedCount = 0;
  var failedCount = 0;
  var taskIds = Object.keys(exported.tasks);

  taskIds.forEach(function (taskId) {
    var bundle = exported.tasks[taskId];
    if (!bundle) return;

    if (bundle.feedback) {
      Object.keys(bundle.feedback).forEach(function (itemId) {
        var rows = bundle.feedback[itemId] || [];
        rows.forEach(function (fb) {
          if (dryRun) {
            records.push({ sourceId: fb.id || fb.FEEDBACK_ID, status: 'PENDING', targetTabOrRole: 'CHECKLIST_FEEDBACK' });
            return;
          }
          var res = clBridgeDispatch_(
            'appendFeedback',
            {
              taskId: taskId,
              checklistItemId: fb.checklistItemId || itemId,
              id: fb.id,
              message: fb.message,
              author: fb.author,
              createdAt: fb.createdAt,
            },
            actor,
            traceId,
          );
          if (res.ok) migratedCount++;
          else failedCount++;
          records.push({ sourceId: fb.id, status: res.ok ? 'MIGRATED' : 'FAILED' });
        });
      });
    }
  });

  return {
    ok: failedCount === 0,
    status: failedCount ? 'FAIL' : 'GO',
    traceId: traceId,
    dryRun: dryRun,
    migratedCount: migratedCount,
    skippedCount: skippedCount,
    failedCount: failedCount,
    records: records,
    warnings: ['Server migration processes subset — prefer workboard UI for full migration'],
    errors: [],
  };
}
