/**
 * PHASE_TASK_GS_03 — Operator observation (performance events).
 */

function taskDbObservationEnabled_() {
  var dev = PropertiesService.getScriptProperties().getProperty('CBV_OBSERVATION_DEV');
  return dev === '1' || dev === 'true';
}

function taskDbAppendObservation_(entry) {
  try {
    var sheetName = CBV_TASK_DB_CONFIG.SHEETS.TASK_OPERATOR_OBSERVATION;
    var info = taskDbReadHeaders_(sheetName);
    if (!info.exists) {
      if (taskDbObservationEnabled_()) {
        var ss = taskDbGetSpreadsheet_();
        var sheet = ss.insertSheet(sheetName);
        var headers = ['ID', 'TYPE', 'MESSAGE', 'TASK_ID', 'ACTOR', 'CREATED_AT', 'SEVERITY', 'DETAIL_JSON'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        info = taskDbReadHeaders_(sheetName);
      } else {
        return false;
      }
    }
    var now = Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
    var obsId = 'OBS-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var row = taskDbRecordToRow_(info.headerMap, info.headers, {
      ID: obsId,
      TYPE: entry.type || 'RUNTIME',
      MESSAGE: entry.message || '',
      TASK_ID: entry.taskId || '',
      ACTOR: entry.actor || 'SYSTEM',
      CREATED_AT: now,
      SEVERITY: entry.severity || 'INFO',
      DETAIL_JSON: JSON.stringify(entry.detail || {}),
    });
    info.sheet.appendRow(row);
    return true;
  } catch (e) {
    return false;
  }
}

function taskDbObserveSnapshotMetrics_(snapshot, elapsedMs, cacheHit) {
  if (cacheHit) return;
  if (elapsedMs >= CBV_TASK_DB_CONFIG.SNAPSHOT_SLOW_MS) {
    taskDbAppendObservation_({
      type: 'SNAPSHOT_SLOW',
      message: 'Workspace snapshot chậm (' + elapsedMs + 'ms)',
      severity: 'WARN',
      detail: { elapsedMs: elapsedMs, taskCount: (snapshot.tasks || []).length },
    });
  }
  if (elapsedMs >= CBV_TASK_DB_CONFIG.CACHE_MISS_SLOW_MS) {
    taskDbAppendObservation_({
      type: 'CACHE_MISS_SLOW',
      message: 'Cache miss snapshot chậm (' + elapsedMs + 'ms)',
      severity: 'WARN',
      detail: { elapsedMs: elapsedMs },
    });
  }
}

function taskDbObserveDetailMetrics_(taskId, elapsedMs) {
  if (elapsedMs >= CBV_TASK_DB_CONFIG.DETAIL_SLOW_MS) {
    taskDbAppendObservation_({
      type: 'DETAIL_SLOW',
      message: 'Task detail chậm (' + elapsedMs + 'ms)',
      taskId: taskId,
      severity: 'WARN',
      detail: { elapsedMs: elapsedMs, taskId: taskId },
    });
  }
}

function taskDbObserveBlockedStale_(tasks) {
  if (!tasks || !tasks.length) return;
  tasks.forEach(function (t) {
    if (t.urgency && t.urgency.isBlocked && t.urgency.staleDays >= CBV_TASK_DB_CONFIG.ESCALATION_STALE_DAYS) {
      taskDbAppendObservation_({
        type: 'BLOCKED_STALE',
        message: 'Task bị kẹt > ' + t.urgency.staleDays + ' ngày',
        taskId: t.taskId,
        severity: 'WARN',
        detail: { taskId: t.taskId, staleDays: t.urgency.staleDays, status: t.status },
      });
    }
  });
}
