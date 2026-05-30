/**
 * PHASE_TASK_GS_01 — Optional CBV_AUDIT_LOG append-only.
 */

function taskDbAppendAudit_(entry) {
  try {
    var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.CBV_AUDIT_LOG);
    if (!info.exists) return false;
    var sheet = info.sheet;
    var now = Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
    var logId = 'AUD-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var row = taskDbRecordToRow_(info.headerMap, info.headers, {
      ID: logId,
      TRACE_ID: entry.traceId || '',
      ACTOR: entry.actor || '',
      ACTION: entry.action || '',
      STATUS: entry.status || 'OK',
      SOURCE: 'TASK_GS_01',
      CREATED_AT: now,
      DETAIL_JSON: JSON.stringify(entry.detail || {}),
    });
    sheet.appendRow(row);
    if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(0);
    return true;
  } catch (e) {
    return false;
  }
}

function taskDbAppendUpdateLog_(record) {
  var info = taskDbGetUpdateLogHeaderMap_();
  if (!info.exists) throw new Error('TASK_UPDATE_LOG sheet not found');
  var now = Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
  var logId = 'TUL-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  var full = {
    ID: logId,
    TASK_ID: record.taskId || record.TASK_ID || '',
    UPDATE_TYPE: record.updateType || record.UPDATE_TYPE || 'NOTE',
    ACTION: record.action || record.ACTION || '',
    ACTOR_ID: record.actorId || record.ACTOR_ID || '',
    CREATED_AT: now,
    CREATED_BY: record.actorName || record.CREATED_BY || record.actorId || '',
    UPDATED_AT: now,
    UPDATED_BY: record.actorName || record.UPDATED_BY || record.actorId || '',
    IS_DELETED: 'false',
  };
  if (record.note) full.ACTION = String(full.ACTION || '') + (full.ACTION ? ' — ' : '') + String(record.note);
  var row = taskDbRecordToRow_(info.headerMap, info.headers, full);
  info.sheet.appendRow(row);
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(0);
  return full;
}
