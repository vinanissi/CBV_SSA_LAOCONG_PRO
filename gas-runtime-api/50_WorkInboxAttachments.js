/**
 * PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1 — TASK_ATTACHMENT CRUD (Work Inbox).
 * Reuses PRO schema: FILE_URL, ATTACHMENT_TYPE, TITLE, NOTE, IS_DELETED, …
 * V1: LINK + TEXT only (no new storage / upload).
 */

var WI_OP_ATTACHMENT_BOOTSTRAP_HEADERS_ = [
  'ID', 'TASK_ID', 'SOURCE_MODE', 'ATTACHMENT_TYPE', 'TITLE',
  'FILE_NAME', 'UPLOAD_FILE', 'FILE_URL', 'DRIVE_FILE_ID',
  'FILE_EXT', 'LINK_DOMAIN', 'SORT_ORDER', 'STATUS', 'NOTE',
  'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED',
];

var WI_OP_ATTACHMENT_TYPES_ = ['LINK', 'TEXT', 'FILE', 'IMAGE'];

function wiOpEnsureAttachmentSheet_() {
  if (typeof ensureSheetWithHeaders_ === 'function') {
    return ensureSheetWithHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT, WI_OP_ATTACHMENT_BOOTSTRAP_HEADERS_);
  }
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT);
  if (!info.exists) {
    var ss = taskDbGetSpreadsheet_();
    var sheet = ss.insertSheet(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT);
    sheet.getRange(1, 1, 1, WI_OP_ATTACHMENT_BOOTSTRAP_HEADERS_.length).setValues([WI_OP_ATTACHMENT_BOOTSTRAP_HEADERS_]);
    info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT);
  }
  return info.sheet || null;
}

function wiOpAttachmentIsTruthy_(val) {
  return val === true || String(val).toLowerCase() === 'true' || String(val) === '1';
}

function wiOpGetAttachmentSheetInfo_() {
  wiOpEnsureAttachmentSheet_();
  return taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT);
}

function wiOpGetAttachmentPhysicalHeaderMap_(info) {
  var lastCol = Math.max(info.sheet.getLastColumn(), 1);
  var headerRow = info.sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headerRow.forEach(function (cell, colIdx) {
    var name = String(cell || '').trim().toUpperCase();
    if (name) map[name] = colIdx;
  });
  return map;
}

function wiOpAttachmentRowToRecord_(physicalMap, values) {
  var rec = {};
  Object.keys(physicalMap).forEach(function (col) {
    rec[col] = values[physicalMap[col]];
  });
  return rec;
}

function wiOpAppendAttachmentRow_(info, record) {
  if (!info || !info.exists || !info.sheet) return null;
  var row =
    typeof wiOpBuildSheetRowPhysical_ === 'function'
      ? wiOpBuildSheetRowPhysical_(info, record)
      : taskDbRecordToRow_(info.headerMap, info.headers, record);
  var width = row.length;
  if (width < 1) throw new Error('TASK_ATTACHMENT: header row width=0');
  var sheet = info.sheet;
  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, width).setValues([row]);
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(0);
  return record;
}

function wiOpPatchAttachmentRow_(found, patch) {
  var sheet = found.info.sheet;
  var physicalMap = wiOpGetAttachmentPhysicalHeaderMap_(found.info);
  Object.keys(patch).forEach(function (col) {
    var idx = physicalMap[col.toUpperCase()];
    if (idx !== undefined) {
      sheet.getRange(found.rowNumber, idx + 1).setValue(patch[col]);
    }
  });
}

function wiOpNormalizeAttachmentType_(raw) {
  var t = String(raw || '').trim().toUpperCase();
  if (WI_OP_ATTACHMENT_TYPES_.indexOf(t) >= 0) return t;
  return '';
}

function wiOpValidateAttachmentUrl_(url) {
  var u = String(url || '').trim();
  if (!u) return 'url là bắt buộc cho LINK';
  if (!/^https?:\/\//i.test(u)) return 'url phải bắt đầu bằng http:// hoặc https://';
  return null;
}

function wiOpMapAttachmentItem_(rec) {
  if (!rec) return null;
  var type = wiOpNormalizeAttachmentType_(rec.ATTACHMENT_TYPE) || (String(rec.FILE_URL || '').trim() ? 'LINK' : 'TEXT');
  var note = String(rec.NOTE || '');
  var url = String(rec.FILE_URL || '').trim();
  return {
    attachmentId: String(rec.ID || ''),
    taskId: String(rec.TASK_ID || ''),
    type: type,
    title: String(rec.TITLE || rec.FILE_NAME || '').trim() || (type === 'LINK' ? url : 'Nội dung dán'),
    url: type === 'LINK' ? url : '',
    textContent: type === 'TEXT' ? note : '',
    fileName: String(rec.FILE_NAME || ''),
    fileId: String(rec.DRIVE_FILE_ID || ''),
    note: type === 'TEXT' ? '' : note,
    source: String(rec.SOURCE_MODE || 'WORK_INBOX'),
    createdAt: String(rec.CREATED_AT || ''),
    createdBy: String(rec.CREATED_BY || ''),
    updatedAt: String(rec.UPDATED_AT || ''),
    updatedBy: String(rec.UPDATED_BY || ''),
    isDeleted: wiOpAttachmentIsTruthy_(rec.IS_DELETED),
  };
}

function wiOpFindAttachmentRow_(attachmentId) {
  var info = wiOpGetAttachmentSheetInfo_();
  if (!info.exists) return null;
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var physicalMap = wiOpGetAttachmentPhysicalHeaderMap_(info);
  for (var i = 0; i < values.length; i++) {
    var rec = wiOpAttachmentRowToRecord_(physicalMap, values[i]);
    if (String(rec.ID) === String(attachmentId)) {
      return { info: info, record: rec, rowNumber: i + 2 };
    }
  }
  return null;
}

function wiOpReadAttachmentRows_(taskId, limit) {
  limit = limit || 50;
  var info = wiOpGetAttachmentSheetInfo_();
  if (!info.exists) return { info: info, rows: [] };
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { info: info, rows: [] };
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var numRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numRows, lastCol).getValues();
  var physicalMap = wiOpGetAttachmentPhysicalHeaderMap_(info);
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var rec = wiOpAttachmentRowToRecord_(physicalMap, values[i]);
    rec._rowNumber = i + 2;
    if (taskId && String(rec.TASK_ID) !== String(taskId)) continue;
    if (wiOpAttachmentIsTruthy_(rec.IS_DELETED)) continue;
    out.push(rec);
  }
  out.sort(function (a, b) {
    return String(b.CREATED_AT || '').localeCompare(String(a.CREATED_AT || ''));
  });
  return { info: info, rows: out.slice(0, limit) };
}

function wiOpAppendAttachmentTimelineAudit_(taskId, timelineType, timelineLabel, auditAction, payload, actor, traceId) {
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
  return { timeline: null, audit: null };
}

function wiOpListAttachments_(taskId) {
  if (!String(taskId || '').trim()) return { ok: false, message: 'taskId là bắt buộc' };
  if (typeof taskDbFindMainRow_ === 'function' && !taskDbFindMainRow_(taskId)) {
    return { ok: false, message: 'Không tìm thấy task' };
  }
  var read = wiOpReadAttachmentRows_(taskId, 50);
  var items = read.rows.map(wiOpMapAttachmentItem_).filter(Boolean);
  return { ok: true, taskId: taskId, items: items, refreshPolicy: 'ATTACHMENTS_ONLY' };
}

function wiOpBuildAttachmentRecord_(payload, actor, attachmentId) {
  var type = wiOpNormalizeAttachmentType_(payload.type || payload.attachmentType);
  if (!type) return { ok: false, message: 'type không hợp lệ (LINK | TEXT)' };
  if (type === 'FILE' || type === 'IMAGE') {
    return { ok: false, message: 'Upload FILE/IMAGE chưa bật trong V1 — dùng LINK hoặc TEXT' };
  }

  var title = String(payload.title || '').trim();
  var url = String(payload.url || '').trim();
  var textContent = String(payload.textContent || payload.text || '').trim();
  var note = String(payload.note || '').trim();

  if (type === 'LINK') {
    var urlErr = wiOpValidateAttachmentUrl_(url);
    if (urlErr) return { ok: false, message: urlErr };
    if (!title) title = url.length > 80 ? url.slice(0, 77) + '...' : url;
  }
  if (type === 'TEXT') {
    if (!textContent && !title) return { ok: false, message: 'textContent hoặc title là bắt buộc cho TEXT' };
    if (!title) title = textContent.length > 80 ? textContent.slice(0, 77) + '...' : textContent;
  }

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var linkDomain = '';
  if (type === 'LINK' && url) {
    try {
      linkDomain = url.replace(/^https?:\/\//i, '').split('/')[0];
    } catch (e) {
      linkDomain = '';
    }
  }

  return {
    ok: true,
    record: {
      ID: attachmentId || taskDbMakeId_('TATT'),
      TASK_ID: String(payload.taskId || ''),
      SOURCE_MODE: 'WORK_INBOX',
      ATTACHMENT_TYPE: type,
      TITLE: title,
      FILE_NAME: type === 'LINK' ? title : '',
      FILE_URL: type === 'LINK' ? url : '',
      DRIVE_FILE_ID: '',
      FILE_EXT: '',
      LINK_DOMAIN: linkDomain,
      SORT_ORDER: payload.sortOrder != null ? Number(payload.sortOrder) : '',
      STATUS: 'ACTIVE',
      NOTE: type === 'TEXT' ? (note ? note + '\n' + textContent : textContent) : note,
      CREATED_AT: now,
      CREATED_BY: actorLabel,
      UPDATED_AT: now,
      UPDATED_BY: actorLabel,
      IS_DELETED: false,
    },
  };
}

function wiOpCreateAttachment_(payload, actor, traceId) {
  payload = payload || {};
  var taskId = String(payload.taskId || '').trim();
  if (!taskId) return { ok: false, message: 'taskId là bắt buộc' };

  var built = wiOpBuildAttachmentRecord_(payload, actor, null);
  if (!built.ok) return built;

  var info = wiOpGetAttachmentSheetInfo_();
  if (!info.exists) return { ok: false, message: 'TASK_ATTACHMENT sheet unavailable' };

  try {
    wiOpAppendAttachmentRow_(info, built.record);
  } catch (err) {
    return { ok: false, message: String(err.message || err) };
  }

  var item = wiOpMapAttachmentItem_(built.record);
  var appendMeta = null;
  try {
    appendMeta = wiOpAppendAttachmentTimelineAudit_(
      taskId,
      'ATTACHMENT_ADDED',
      'Thêm tài liệu: ' + (item.title || item.type),
      'ACTION_ATTACHMENT_CREATE',
      { attachmentId: item.attachmentId, type: item.type, title: item.title },
      actor,
      traceId || payload.traceId,
    );
  } catch (metaErr) {
    return {
      ok: true,
      item: item,
      timelineEvent: null,
      auditEvent: null,
      refreshPolicy: 'ATTACHMENTS_ONLY',
      warnings: ['ATTACHMENT_CREATED_TIMELINE_AUDIT_SKIPPED: ' + String(metaErr.message || metaErr)],
    };
  }

  return {
    ok: true,
    item: item,
    timelineEvent: appendMeta && appendMeta.timeline ? appendMeta.timeline : null,
    auditEvent: appendMeta && appendMeta.audit ? appendMeta.audit : null,
    refreshPolicy: 'ATTACHMENTS_ONLY',
  };
}

function wiOpUpdateAttachment_(payload, actor, traceId) {
  payload = payload || {};
  var attachmentId = String(payload.attachmentId || '').trim();
  if (!attachmentId) return { ok: false, message: 'attachmentId là bắt buộc' };

  var found = wiOpFindAttachmentRow_(attachmentId);
  if (!found || wiOpAttachmentIsTruthy_(found.record.IS_DELETED)) {
    return { ok: false, message: 'Không tìm thấy tài liệu' };
  }

  var mergePayload = {
    taskId: found.record.TASK_ID,
    type: payload.type != null ? payload.type : found.record.ATTACHMENT_TYPE,
    title: payload.title != null ? payload.title : found.record.TITLE,
    url: payload.url != null ? payload.url : found.record.FILE_URL,
    textContent: payload.textContent != null ? payload.textContent : found.record.NOTE,
    note: payload.note != null ? payload.note : '',
  };
  var built = wiOpBuildAttachmentRecord_(mergePayload, actor, attachmentId);
  if (!built.ok) return built;

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  var patch = {
    TITLE: built.record.TITLE,
    ATTACHMENT_TYPE: built.record.ATTACHMENT_TYPE,
    FILE_URL: built.record.FILE_URL,
    NOTE: built.record.NOTE,
    LINK_DOMAIN: built.record.LINK_DOMAIN,
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
  };
  wiOpPatchAttachmentRow_(found, patch);
  Object.keys(patch).forEach(function (k) {
    found.record[k] = patch[k];
  });
  var item = wiOpMapAttachmentItem_(found.record);

  try {
    wiOpAppendAttachmentTimelineAudit_(
      String(found.record.TASK_ID),
      'ATTACHMENT_UPDATED',
      'Sửa tài liệu: ' + item.title,
      'ACTION_ATTACHMENT_UPDATE',
      { attachmentId: attachmentId },
      actor,
      traceId || payload.traceId,
    );
  } catch (e) {
    /* non-fatal */
  }

  return { ok: true, item: item, refreshPolicy: 'ATTACHMENTS_ONLY' };
}

function wiOpSoftDeleteAttachment_(payload, actor, traceId) {
  payload = payload || {};
  var attachmentId = String(payload.attachmentId || '').trim();
  if (!attachmentId) return { ok: false, message: 'attachmentId là bắt buộc' };

  var found = wiOpFindAttachmentRow_(attachmentId);
  if (!found || wiOpAttachmentIsTruthy_(found.record.IS_DELETED)) {
    return { ok: false, message: 'Không tìm thấy tài liệu' };
  }

  var now = typeof wiOpNow_ === 'function' ? wiOpNow_() : taskDbNowIso_();
  var actorLabel = (actor && (actor.displayName || actor.userId)) || 'OPERATOR';
  wiOpPatchAttachmentRow_(found, {
    IS_DELETED: true,
    UPDATED_AT: now,
    UPDATED_BY: actorLabel,
  });

  var taskId = String(found.record.TASK_ID || '');
  var title = String(found.record.TITLE || '');
  try {
    wiOpAppendAttachmentTimelineAudit_(
      taskId,
      'ATTACHMENT_DELETED',
      'Xóa tài liệu: ' + title,
      'ACTION_ATTACHMENT_DELETE',
      { attachmentId: attachmentId, title: title },
      actor,
      traceId || payload.traceId,
    );
  } catch (e) {
    /* non-fatal */
  }

  return {
    ok: true,
    attachmentId: attachmentId,
    deleted: true,
    refreshPolicy: 'ATTACHMENTS_ONLY',
  };
}

function wiOpCreateFileAttachment_(payload, actor, traceId) {
  return { ok: false, message: 'Upload FILE chưa bật V1 — dùng LINK hoặc TEXT', traceId: traceId };
}

function wiOpCreatePastedImageAttachment_(payload, actor, traceId) {
  return { ok: false, message: 'Upload IMAGE chưa bật V1 — dùng LINK hoặc TEXT', traceId: traceId };
}
