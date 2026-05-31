/**
 * RF_12 — GAS Runtime API — Append-only timeline.
 */

function appendTimeline_(event) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASK_TIMELINE, RF12_CONFIG.TIMELINE_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var rowObj = {
    event_id: event.eventId || makeId_('EVT'),
    task_id: event.taskId,
    actor: event.actor,
    action: event.action,
    before_json: event.before ? JSON.stringify(event.before) : '',
    after_json: event.after ? JSON.stringify(event.after) : '',
    note: event.note || '',
    trace_id: event.traceId || buildTraceId_(),
    created_at: event.createdAt || nowIso_(),
  };
  sheet.appendRow(objectToRow_(headerMap, rowObj));
  return {
    eventId: rowObj.event_id,
    taskId: rowObj.task_id,
    actor: rowObj.actor,
    action: rowObj.action,
    before: event.before || null,
    after: event.after || null,
    note: rowObj.note,
    createdAt: rowObj.created_at,
    traceId: rowObj.trace_id,
    source: 'RF_12_GAS_RUNTIME',
  };
}

function getTimelineForTask_(taskId) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASK_TIMELINE, RF12_CONFIG.TIMELINE_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var events = [];
  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var row = rowToObject_(sheet, r, headerMap);
    if (String(row.task_id) === String(taskId)) {
      events.push({
        time: String(row.created_at || ''),
        actor: String(row.actor || ''),
        action: String(row.action || ''),
        message: String(row.note || row.after_json || ''),
        source: 'RF_12_GAS_RUNTIME',
        resourceId: String(taskId),
      });
    }
  }
  return events;
}

function appendAuditLog_(entry) {
  bootstrapSheets_();
  var sheet = ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.API_AUDIT_LOG, RF12_CONFIG.AUDIT_HEADERS);
  var headerMap = getHeaderMap_(sheet);
  var rowObj = {
    log_id: entry.logId || makeId_('AUD'),
    trace_id: entry.traceId || buildTraceId_(),
    actor: entry.actor || 'SYSTEM',
    action: entry.action || 'UNKNOWN',
    status: entry.status || 'OK',
    source: entry.source || 'RF_12_GAS_RUNTIME',
    created_at: entry.createdAt || nowIso_(),
    detail_json: entry.detail ? JSON.stringify(entry.detail) : '',
  };
  sheet.appendRow(objectToRow_(headerMap, rowObj));
  return rowObj;
}
