/**
 * PHASE_WORK_INBOX_LATENCY_P1 — fast append (setValues) + batch OP_STORE + micro-timers.
 */

/**
 * HOTFIX_WORK_INBOX_CHECKLIST_APPEND_ROW_WIDTH — row width = physical header columns (headerRow.map).
 * Avoids taskDbRecordToRow_ filtered-headers length mismatch on wide sheets (e.g. 65 cols).
 */
function wiOpBuildSheetRowPhysical_(info, record) {
  if (!info || !info.sheet) return [];
  var sheet = info.sheet;
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var normalized = {};
  Object.keys(record || {}).forEach(function (key) {
    normalized[String(key).toUpperCase()] = record[key];
  });
  var dense = [];
  for (var i = 0; i < headerRow.length; i++) {
    var colName = String(headerRow[i] || '').trim().toUpperCase();
    dense.push(colName && normalized[colName] !== undefined ? normalized[colName] : '');
  }
  return dense;
}

function wiOpAppendRowFast_(info, record, timerKeys) {
  timerKeys = timerKeys || {};
  if (!info || !info.exists) return null;
  var rowBuildStart = Date.now();
  var row =
    typeof wiOpBuildSheetRowPhysical_ === 'function'
      ? wiOpBuildSheetRowPhysical_(info, record)
      : taskDbRecordToRow_(info.headerMap, info.headers, record);
  if (timerKeys.rowBuild && typeof wiPerfMarkPhase_ === 'function') {
    wiPerfMarkPhase_(timerKeys.rowBuild, Date.now() - rowBuildStart);
  }
  var writeStart = Date.now();
  var sheet = info.sheet;
  var nextRow = sheet.getLastRow() + 1;
  var width = row.length;
  if (width < 1) return null;
  // GAS 4-arg: (startRow, startCol, numRows, numCols)
  sheet.getRange(nextRow, 1, 1, width).setValues([row]);
  var writeMs = Date.now() - writeStart;
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(writeMs);
  if (timerKeys.write && typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_(timerKeys.write, writeMs);
  if (timerKeys.sheet && typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_(timerKeys.sheet, writeMs);
  return record;
}

function wiOpAppendRowWithInfo_(info, record) {
  if (CBV_WI_OP_CONFIG.USE_SET_VALUES_APPEND) {
    return wiOpAppendRowFast_(info, record, {});
  }
  if (!info || !info.exists) return null;
  var row =
    typeof wiOpBuildSheetRowPhysical_ === 'function'
      ? wiOpBuildSheetRowPhysical_(info, record)
      : taskDbRecordToRow_(info.headerMap, info.headers, record);
  info.sheet.appendRow(row);
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(0);
  return record;
}

function wiOpAppendOpStoreBatch_(entries) {
  entries = entries || [];
  if (!entries.length) return false;
  var info =
    WI_OP_APPEND_CTX_ && WI_OP_APPEND_CTX_.opStoreInfo
      ? WI_OP_APPEND_CTX_.opStoreInfo
      : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.OP_STORE);
  if (!info.exists) return false;
  var sheet = info.sheet;
  var matrix = [];
  var buildStart = Date.now();
  entries.forEach(function (entry) {
    var id = wiOpMakeId_('WIO');
    var row = {
      ID: id,
      ENTITY_TYPE: entry.entityType,
      TASK_ID: String(entry.taskId || ''),
      PAYLOAD_JSON: JSON.stringify(entry.payload || {}),
      CREATED_AT: wiOpNow_(),
    };
    matrix.push(
      typeof wiOpBuildSheetRowPhysical_ === 'function'
        ? wiOpBuildSheetRowPhysical_(info, row)
        : taskDbRecordToRow_(info.headerMap, info.headers, row),
    );
  });
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('appendBatchRowBuildMs', Date.now() - buildStart);
  var writeStart = Date.now();
  var nextRow = sheet.getLastRow() + 1;
  var width = 0;
  matrix.forEach(function (r) {
    if (r.length > width) width = r.length;
  });
  if (width < 1) return false;
  matrix = matrix.map(function (r) {
    var padded = r.slice();
    while (padded.length < width) padded.push('');
    return padded;
  });
  sheet.getRange(nextRow, 1, matrix.length, width).setValues(matrix);
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(Date.now() - writeStart);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('appendBatchWriteMs', Date.now() - writeStart);
  return true;
}

/**
 * Combined timeline + audit append for record-action (shared context, no legacy mirrors by default).
 */
function wiOpAppendTimelineAndAuditCombined_(timelineEntry, auditEntry) {
  var tlStart = Date.now();
  var timelineId = wiOpMakeId_('TL');
  var auditId = wiOpMakeId_('AUD');
  var now = wiOpNow_();

  var tlRecord = {
    timeline_id: timelineId,
    TIMELINE_ID: timelineId,
    task_id: String(timelineEntry.taskId || ''),
    TASK_ID: String(timelineEntry.taskId || ''),
    event_type: String(timelineEntry.eventType || ''),
    EVENT_TYPE: String(timelineEntry.eventType || ''),
    event_label: String(timelineEntry.eventLabel || timelineEntry.eventType || ''),
    EVENT_LABEL: String(timelineEntry.eventLabel || timelineEntry.eventType || ''),
    actor: String(timelineEntry.actor || ''),
    ACTOR: String(timelineEntry.actor || ''),
    payload: JSON.stringify(timelineEntry.payload || {}),
    PAYLOAD: JSON.stringify(timelineEntry.payload || {}),
    created_at: now,
    CREATED_AT: now,
  };

  var audRecord = {
    audit_id: auditId,
    AUDIT_ID: auditId,
    trace_id: String(auditEntry.traceId || ''),
    TRACE_ID: String(auditEntry.traceId || ''),
    task_id: String(auditEntry.taskId || ''),
    TASK_ID: String(auditEntry.taskId || ''),
    action: String(auditEntry.action || ''),
    ACTION: String(auditEntry.action || ''),
    actor: String(auditEntry.actor || ''),
    ACTOR: String(auditEntry.actor || ''),
    actor_role: String(auditEntry.actorRole || auditEntry.actor_role || ''),
    ACTOR_ROLE: String(auditEntry.actorRole || auditEntry.actor_role || ''),
    before_state: String(auditEntry.beforeState || auditEntry.before_state || ''),
    BEFORE_STATE: String(auditEntry.beforeState || auditEntry.before_state || ''),
    after_state: String(auditEntry.afterState || auditEntry.after_state || ''),
    AFTER_STATE: String(auditEntry.afterState || auditEntry.after_state || ''),
    payload: JSON.stringify(auditEntry.payload || {}),
    PAYLOAD: JSON.stringify(auditEntry.payload || {}),
    created_at: now,
    CREATED_AT: now,
  };

  var tlInfo =
    WI_OP_APPEND_CTX_ && WI_OP_APPEND_CTX_.timelineInfo
      ? WI_OP_APPEND_CTX_.timelineInfo
      : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_TIMELINE);
  var audInfo =
    WI_OP_APPEND_CTX_ && WI_OP_APPEND_CTX_.auditInfo
      ? WI_OP_APPEND_CTX_.auditInfo
      : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.ACTION_AUDIT_LOG);

  if (typeof wiPerfMarkPhase_ === 'function') {
    wiPerfMarkPhase_('timelineHeaderMs', 0);
    wiPerfMarkPhase_('auditHeaderMs', 0);
  }

  if (tlInfo.exists && audInfo.exists) {
    var tlWriteStart = Date.now();
    wiOpAppendRowFast_(tlInfo, tlRecord, {
      rowBuild: 'timelineRowBuildMs',
      write: 'timelineWriteMs',
      sheet: 'timelineSheetMs',
    });
    if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineAppendMs', Date.now() - tlStart);

    var audStart = Date.now();
    wiOpAppendRowFast_(audInfo, audRecord, {
      rowBuild: 'auditRowBuildMs',
      write: 'auditWriteMs',
      sheet: 'auditSheetMs',
    });
    if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditAppendMs', Date.now() - audStart);
  } else {
    wiOpAppendOpStoreBatch_([
      { entityType: 'TASK_TIMELINE', taskId: tlRecord.task_id, payload: tlRecord },
      { entityType: 'ACTION_AUDIT_LOG', taskId: audRecord.task_id, payload: audRecord },
    ]);
    if (CBV_WI_OP_CONFIG.MIRROR_TIMELINE_TO_LEGACY_LOG && typeof taskDbAppendUpdateLog_ === 'function') {
      var mirrorStart = Date.now();
      taskDbAppendUpdateLog_({
        taskId: tlRecord.task_id,
        updateType: 'OPERATIONAL_TIMELINE',
        action: tlRecord.event_type,
        actorId: tlRecord.actor,
        actorName: tlRecord.actor,
        note: tlRecord.event_label,
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineMirrorMs', Date.now() - mirrorStart);
    }
    if (CBV_WI_OP_CONFIG.MIRROR_AUDIT_TO_LEGACY_LOG && typeof taskDbAppendAudit_ === 'function') {
      var audMirrorStart = Date.now();
      taskDbAppendAudit_({
        traceId: audRecord.trace_id,
        actor: audRecord.actor,
        action: audRecord.action,
        detail: { audit_id: auditId, task_id: audRecord.task_id },
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditMirrorMs', Date.now() - audMirrorStart);
    }
  }

  if (typeof wiPerfMarkPhase_ === 'function') {
    if (!tlInfo.exists || !audInfo.exists) {
      wiPerfMarkPhase_('timelineAppendMs', Date.now() - tlStart);
      wiPerfMarkPhase_('auditAppendMs', Date.now() - tlStart);
    }
  }

  return {
    timeline: { ok: true, timelineId: timelineId, server: true },
    audit: { ok: true, auditId: auditId, server: true },
  };
}
