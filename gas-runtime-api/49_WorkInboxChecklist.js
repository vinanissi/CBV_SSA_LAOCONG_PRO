/**
 * PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — TASK_CHECKLIST CRUD via Work Inbox (GAS).
 * Schema: existing TASK_CHECKLIST (ID, TASK_ID, ITEM_NO, TITLE, IS_DONE, IS_DELETED, …).
 */

var WI_OP_CHECKLIST_HEADERS_ = [
  'ID', 'TASK_ID', 'ITEM_NO', 'TITLE', 'IS_REQUIRED', 'IS_DONE', 'DONE_AT', 'DONE_BY',
  'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED',
];

function wiOpEnsureChecklistSheet_() {
  if (typeof ensureSheetWithHeaders_ === 'function') {
    return ensureSheetWithHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST, WI_OP_CHECKLIST_HEADERS_);
  }
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
  if (!info.exists) {
    var ss = taskDbGetSpreadsheet_();
    var sheet = ss.insertSheet(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
    sheet.getRange(1, 1, 1, WI_OP_CHECKLIST_HEADERS_.length).setValues([WI_OP_CHECKLIST_HEADERS_]);
    info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
  }
  return info.sheet || null;
}

function wiOpIsTruthy_(val) {
  return val === true || String(val).toLowerCase() === 'true' || String(val) === '1';
}

/**
 * HOTFIX_WORK_INBOX_CHECKLIST_APPEND_ROW_WIDTH — build row aligned to physical sheet columns.
 * taskDbRecordToRow_ uses filtered headers.length; wide TASK_CHECKLIST tabs need lastCol width.
 */
function wiOpGetChecklistSheetWidth_(info) {
  if (!info || !info.sheet) return 1;
  return Math.max(info.sheet.getLastColumn(), WI_OP_CHECKLIST_HEADERS_.length, 1);
}

function wiOpReadChecklistHeaderRow_(info) {
  var lastCol = wiOpGetChecklistSheetWidth_(info);
  return info.sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function wiOpNormalizeChecklistRecord_(record) {
  var out = {};
  Object.keys(record || {}).forEach(function (key) {
    out[String(key).toUpperCase()] = record[key];
  });
  return out;
}

function wiOpBuildChecklistSheetRow_(info, record) {
  if (typeof wiOpBuildSheetRowPhysical_ === 'function') {
    return wiOpBuildSheetRowPhysical_(info, record);
  }
  var headerRow = wiOpReadChecklistHeaderRow_(info);
  var normalized = wiOpNormalizeChecklistRecord_(record);
  var dense = [];
  for (var i = 0; i < headerRow.length; i++) {
    var colName = String(headerRow[i] || '').trim().toUpperCase();
    dense.push(colName && normalized[colName] !== undefined ? normalized[colName] : '');
  }
  return dense;
}

function wiOpAppendChecklistRow_(info, record) {
  if (!info || !info.exists || !info.sheet) return null;
  var sheet = info.sheet;
  var row = wiOpBuildChecklistSheetRow_(info, record);
  var width = row.length;
  if (width < 1) {
    throw new Error('TASK_CHECKLIST: không đọc được header row (width=0)');
  }
  var nextRow = sheet.getLastRow() + 1;
  try {
    // GAS 4-arg: getRange(startRow, startCol, numRows, numCols) — NOT endRow/endCol
    sheet.getRange(nextRow, 1, 1, width).setValues([row]);
  } catch (err) {
    throw new Error(
      'TASK_CHECKLIST setValues failed (sheetRow=' + nextRow + ', cols=' + width + '): ' + String(err.message || err),
    );
  }
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(0);
  return record;
}

function wiOpGetChecklistPhysicalHeaderMap_(info) {
  var headerRow = wiOpReadChecklistHeaderRow_(info);
  var map = {};
  headerRow.forEach(function (cell, colIdx) {
    var name = String(cell || '').trim().toUpperCase();
    if (name) map[name] = colIdx;
  });
  return map;
}

function wiOpChecklistRowToRecord_(physicalMap, values) {
  var rec = {};
  Object.keys(physicalMap).forEach(function (col) {
    rec[col] = values[physicalMap[col]];
  });
  return rec;
}

function wiOpMapChecklistItem_(rec) {
  if (!rec) return null;
  var done = wiOpIsTruthy_(rec.IS_DONE);
  return {
    checklistId: String(rec.ID || ''),
    taskId: String(rec.TASK_ID || ''),
    title: String(rec.TITLE || '').trim(),
    status: done ? 'done' : 'open',
    sortOrder: Number(rec.ITEM_NO) || 0,
    isRequired: wiOpIsTruthy_(rec.IS_REQUIRED),
    isDone: done,
    doneAt: String(rec.DONE_AT || ''),
    doneBy: String(rec.DONE_BY || ''),
    note: String(rec.NOTE || ''),
    createdAt: String(rec.CREATED_AT || ''),
    createdBy: String(rec.CREATED_BY || ''),
    updatedAt: String(rec.UPDATED_AT || ''),
    updatedBy: String(rec.UPDATED_BY || ''),
    isDeleted: wiOpIsTruthy_(rec.IS_DELETED),
  };
}

function wiOpReadChecklistRows_(taskId) {
  wiOpEnsureChecklistSheet_();
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
  if (!info.exists) return { info: info, rows: [] };
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { info: info, rows: [] };
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var out = [];
  var physicalMap = wiOpGetChecklistPhysicalHeaderMap_(info);
  for (var i = 0; i < values.length; i++) {
    var rec = wiOpChecklistRowToRecord_(physicalMap, values[i]);
    rec._rowNumber = i + 2;
    if (taskId && String(rec.TASK_ID) !== String(taskId)) continue;
    if (wiOpIsTruthy_(rec.IS_DELETED)) continue;
    out.push(rec);
  }
  out.sort(function (a, b) {
    var na = Number(a.ITEM_NO) || 0;
    var nb = Number(b.ITEM_NO) || 0;
    if (na !== nb) return na - nb;
    return String(a.CREATED_AT || '').localeCompare(String(b.CREATED_AT || ''));
  });
  return { info: info, rows: out };
}

function wiOpFindChecklistRow_(checklistId) {
  wiOpEnsureChecklistSheet_();
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
  if (!info.exists) return null;
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var physicalMap = wiOpGetChecklistPhysicalHeaderMap_(info);
  for (var i = 0; i < values.length; i++) {
    var rec = wiOpChecklistRowToRecord_(physicalMap, values[i]);
    if (String(rec.ID) === String(checklistId)) {
      return { info: info, record: rec, rowNumber: i + 2 };
    }
  }
  return null;
}

function wiOpPatchChecklistRow_(found, patch) {
  var info = found.info;
  var sheet = info.sheet;
  var physicalMap = wiOpGetChecklistPhysicalHeaderMap_(info);
  Object.keys(patch).forEach(function (col) {
    var idx = physicalMap[col.toUpperCase()];
    if (idx !== undefined) {
      sheet.getRange(found.rowNumber, idx + 1).setValue(patch[col]);
    }
  });
}

function wiOpAssertTaskExists_(taskId) {
  var found = typeof taskDbFindMainRow_ === 'function' ? taskDbFindMainRow_(taskId) : null;
  if (!found) return { ok: false, message: 'Không tìm thấy task' };
  return { ok: true, found: found };
}

function wiOpAppendChecklistTimelineAudit_(taskId, timelineType, timelineLabel, auditAction, payload, actor, traceId) {
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var actorRole = String((actor && actor.role) || 'OPERATOR').toUpperCase();
  if (typeof wiOpAppendTimelineAndAuditCombined_ === 'function') {
    return wiOpAppendTimelineAndAuditCombined_(
      {
        taskId: taskId,
        eventType: timelineType,
        eventLabel: timelineLabel,
        actor: actorLabel,
        payload: payload || {},
      },
      {
        taskId: taskId,
        traceId: traceId,
        action: auditAction,
        actor: actorLabel,
        actorRole: actorRole,
        beforeState: '',
        afterState: timelineLabel,
        payload: payload || {},
      },
    );
  }
  var timelineEvent = null;
  var auditEvent = null;
  if (typeof wiOpAppendTimeline_ === 'function') {
    timelineEvent = wiOpAppendTimeline_({
      taskId: taskId,
      eventType: timelineType,
      eventLabel: timelineLabel,
      actor: actorLabel,
      payload: payload || {},
    });
  }
  if (typeof wiOpAppendActionAudit_ === 'function') {
    auditEvent = wiOpAppendActionAudit_({
      taskId: taskId,
      traceId: traceId,
      action: auditAction,
      actor: actorLabel,
      actorRole: actorRole,
      beforeState: '',
      afterState: timelineLabel,
      payload: payload || {},
    });
  }
  return { timeline: timelineEvent, audit: auditEvent };
}

function wiOpListChecklist_(taskId) {
  if (!String(taskId || '').trim()) return { ok: false, message: 'taskId là bắt buộc' };
  var taskCheck = wiOpAssertTaskExists_(taskId);
  if (!taskCheck.ok) return taskCheck;
  var read = wiOpReadChecklistRows_(taskId);
  var items = read.rows.map(wiOpMapChecklistItem_).filter(Boolean);
  return { ok: true, taskId: taskId, items: items, refreshPolicy: 'CHECKLIST_ONLY' };
}

function wiOpCreateChecklistItem_(payload, actor, traceId) {
  payload = payload || {};
  var taskId = String(payload.taskId || '').trim();
  var title = String(payload.title || '').trim();
  if (!taskId) return { ok: false, message: 'taskId là bắt buộc' };
  if (!title) return { ok: false, message: 'title là bắt buộc' };
  if (title.length > 500) return { ok: false, message: 'title tối đa 500 ký tự' };

  var taskCheck = wiOpAssertTaskExists_(taskId);
  if (!taskCheck.ok) return taskCheck;

  wiOpEnsureChecklistSheet_();
  var read = wiOpReadChecklistRows_(taskId);
  var nextNo = read.rows.length + 1;
  if (payload.sortOrder != null && !isNaN(Number(payload.sortOrder))) {
    nextNo = Number(payload.sortOrder);
  } else if (payload.itemNo != null && !isNaN(Number(payload.itemNo))) {
    nextNo = Number(payload.itemNo);
  }

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var checklistId = taskDbMakeId_('TCL');
  var record = {
    ID: checklistId,
    TASK_ID: taskId,
    ITEM_NO: nextNo,
    TITLE: title,
    IS_REQUIRED: payload.isRequired === true || String(payload.isRequired) === 'true',
    IS_DONE: false,
    DONE_AT: '',
    DONE_BY: '',
    NOTE: String(payload.note || ''),
    CREATED_AT: now,
    CREATED_BY: actorLabel,
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
    IS_DELETED: false,
  };

  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_CHECKLIST);
  if (!info.exists) return { ok: false, message: 'TASK_CHECKLIST sheet unavailable' };
  try {
    wiOpAppendChecklistRow_(info, record);
  } catch (appendErr) {
    return { ok: false, message: String(appendErr.message || appendErr) };
  }

  var item = wiOpMapChecklistItem_(record);
  var appendMeta = null;
  try {
    appendMeta = wiOpAppendChecklistTimelineAudit_(
      taskId,
      'CHECKLIST_ITEM_CREATED',
      'Thêm mục checklist: ' + title,
      'ACTION_CHECKLIST_CREATE',
      { checklistId: checklistId, title: title },
      actor,
      traceId || payload.traceId,
    );
  } catch (metaErr) {
    return {
      ok: true,
      item: item,
      timelineEvent: null,
      auditEvent: null,
      refreshPolicy: 'CHECKLIST_ONLY',
      warnings: ['CHECKLIST_CREATED_TIMELINE_AUDIT_SKIPPED: ' + String(metaErr.message || metaErr)],
    };
  }

  return {
    ok: true,
    item: item,
    timelineEvent: appendMeta && appendMeta.timeline ? appendMeta.timeline : null,
    auditEvent: appendMeta && appendMeta.audit ? appendMeta.audit : null,
    refreshPolicy: 'CHECKLIST_ONLY',
  };
}

function wiOpUpdateChecklistItem_(payload, actor, traceId) {
  payload = payload || {};
  var checklistId = String(payload.checklistId || '').trim();
  var title = payload.title != null ? String(payload.title).trim() : null;
  if (!checklistId) return { ok: false, message: 'checklistId là bắt buộc' };
  if (title !== null && !title) return { ok: false, message: 'title không được rỗng' };

  var found = wiOpFindChecklistRow_(checklistId);
  if (!found || wiOpIsTruthy_(found.record.IS_DELETED)) {
    return { ok: false, message: 'Không tìm thấy mục checklist' };
  }

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var patch = {
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
  };
  if (title !== null) patch.TITLE = title;
  if (payload.sortOrder != null && !isNaN(Number(payload.sortOrder))) patch.ITEM_NO = Number(payload.sortOrder);
  if (payload.note != null) patch.NOTE = String(payload.note);

  wiOpPatchChecklistRow_(found, patch);
  Object.keys(patch).forEach(function (k) {
    found.record[k] = patch[k];
  });
  var item = wiOpMapChecklistItem_(found.record);
  var appendMeta = wiOpAppendChecklistTimelineAudit_(
    String(found.record.TASK_ID),
    'CHECKLIST_ITEM_UPDATED',
    'Sửa mục checklist: ' + (item.title || checklistId),
    'ACTION_CHECKLIST_UPDATE',
    { checklistId: checklistId, title: item.title },
    actor,
    traceId || payload.traceId,
  );

  return {
    ok: true,
    item: item,
    timelineEvent: appendMeta && appendMeta.timeline ? appendMeta.timeline : null,
    auditEvent: appendMeta && appendMeta.audit ? appendMeta.audit : null,
    refreshPolicy: 'CHECKLIST_ONLY',
  };
}

function wiOpToggleChecklistItem_(payload, actor, traceId) {
  payload = payload || {};
  var checklistId = String(payload.checklistId || '').trim();
  if (!checklistId) return { ok: false, message: 'checklistId là bắt buộc' };

  var found = wiOpFindChecklistRow_(checklistId);
  if (!found || wiOpIsTruthy_(found.record.IS_DELETED)) {
    return { ok: false, message: 'Không tìm thấy mục checklist' };
  }

  var currentlyDone = wiOpIsTruthy_(found.record.IS_DONE);
  var targetDone = payload.isDone != null ? wiOpIsTruthy_(payload.isDone) : !currentlyDone;
  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var actorId = (actor && actor.userId) || actorLabel;
  var patch = {
    IS_DONE: targetDone,
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
  };
  if (targetDone) {
    patch.DONE_AT = now;
    patch.DONE_BY = actorId;
  } else {
    patch.DONE_AT = '';
    patch.DONE_BY = '';
  }

  wiOpPatchChecklistRow_(found, patch);
  Object.keys(patch).forEach(function (k) {
    found.record[k] = patch[k];
  });
  var item = wiOpMapChecklistItem_(found.record);
  var eventType = targetDone ? 'CHECKLIST_ITEM_DONE' : 'CHECKLIST_ITEM_REOPENED';
  var eventLabel = targetDone ? 'Hoàn thành mục: ' + item.title : 'Mở lại mục: ' + item.title;
  var auditAction = targetDone ? 'ACTION_CHECKLIST_DONE' : 'ACTION_CHECKLIST_UNDONE';

  var appendMeta = wiOpAppendChecklistTimelineAudit_(
    String(found.record.TASK_ID),
    eventType,
    eventLabel,
    auditAction,
    { checklistId: checklistId, isDone: targetDone },
    actor,
    traceId || payload.traceId,
  );

  return {
    ok: true,
    item: item,
    timelineEvent: appendMeta && appendMeta.timeline ? appendMeta.timeline : null,
    auditEvent: appendMeta && appendMeta.audit ? appendMeta.audit : null,
    refreshPolicy: 'CHECKLIST_ONLY',
  };
}

function wiOpSoftDeleteChecklistItem_(payload, actor, traceId) {
  payload = payload || {};
  var checklistId = String(payload.checklistId || '').trim();
  if (!checklistId) return { ok: false, message: 'checklistId là bắt buộc' };

  var found = wiOpFindChecklistRow_(checklistId);
  if (!found || wiOpIsTruthy_(found.record.IS_DELETED)) {
    return { ok: false, message: 'Không tìm thấy mục checklist' };
  }

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var patch = {
    IS_DELETED: true,
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
  };
  wiOpPatchChecklistRow_(found, patch);

  var title = String(found.record.TITLE || '');
  var taskId = String(found.record.TASK_ID || '');
  var appendMeta = wiOpAppendChecklistTimelineAudit_(
    taskId,
    'CHECKLIST_ITEM_DELETED',
    'Xóa mục checklist: ' + title,
    'ACTION_CHECKLIST_DELETE',
    { checklistId: checklistId, title: title },
    actor,
    traceId || payload.traceId,
  );

  return {
    ok: true,
    checklistId: checklistId,
    deleted: true,
    timelineEvent: appendMeta && appendMeta.timeline ? appendMeta.timeline : null,
    auditEvent: appendMeta && appendMeta.audit ? appendMeta.audit : null,
    refreshPolicy: 'CHECKLIST_ONLY',
  };
}
