/**
 * PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME — append-only operational entities (GAS).
 */

function wiOpNow_() {
  return Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function wiOpMakeId_(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function wiOpAppendRow_(sheetName, record) {
  var info = taskDbReadHeaders_(sheetName);
  if (!info.exists) return null;
  var row = taskDbRecordToRow_(info.headerMap, info.headers, record);
  info.sheet.appendRow(row);
  return record;
}

function wiOpAppendOpStore_(entityType, taskId, payload) {
  var storeName = CBV_WI_OP_CONFIG.SHEETS.OP_STORE;
  var info = taskDbReadHeaders_(storeName);
  if (!info.exists) return null;
  var id = wiOpMakeId_('WIO');
  var row = {
    ID: id,
    ENTITY_TYPE: entityType,
    TASK_ID: String(taskId || ''),
    PAYLOAD_JSON: JSON.stringify(payload || {}),
    CREATED_AT: wiOpNow_(),
  };
  wiOpAppendRow_(storeName, row);
  return { id: id, entityType: entityType, taskId: taskId, payload: payload, createdAt: row.CREATED_AT };
}

function wiOpReadOpStore_(entityType, taskId, limit) {
  limit = limit || CBV_WI_OP_CONFIG.PREVIEW_LIMIT;
  var storeName = CBV_WI_OP_CONFIG.SHEETS.OP_STORE;
  var info = taskDbReadHeaders_(storeName);
  if (!info.exists) return [];
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var out = [];
  for (var i = values.length - 1; i >= 0 && out.length < limit * 5; i--) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    if (String(rec.ENTITY_TYPE) !== String(entityType)) continue;
    if (taskId && String(rec.TASK_ID) !== String(taskId)) continue;
    var payload = {};
    try {
      payload = JSON.parse(String(rec.PAYLOAD_JSON || '{}'));
    } catch (e) {
      payload = { raw: String(rec.PAYLOAD_JSON || '') };
    }
    out.push({
      id: String(rec.ID || ''),
      entityType: String(rec.ENTITY_TYPE || ''),
      taskId: String(rec.TASK_ID || ''),
      createdAt: String(rec.CREATED_AT || ''),
      payload: payload,
    });
  }
  return out.slice(0, limit);
}

function wiOpAppendActionAudit_(entry) {
  var headerStart = Date.now();
  var auditId = wiOpMakeId_('AUD');
  var now = wiOpNow_();
  var record = {
    audit_id: auditId,
    AUDIT_ID: auditId,
    trace_id: String(entry.traceId || ''),
    TRACE_ID: String(entry.traceId || ''),
    task_id: String(entry.taskId || ''),
    TASK_ID: String(entry.taskId || ''),
    action: String(entry.action || ''),
    ACTION: String(entry.action || ''),
    actor: String(entry.actor || ''),
    ACTOR: String(entry.actor || ''),
    actor_role: String(entry.actorRole || entry.actor_role || ''),
    ACTOR_ROLE: String(entry.actorRole || entry.actor_role || ''),
    before_state: String(entry.beforeState || entry.before_state || ''),
    BEFORE_STATE: String(entry.beforeState || entry.before_state || ''),
    after_state: String(entry.afterState || entry.after_state || ''),
    AFTER_STATE: String(entry.afterState || entry.after_state || ''),
    payload: JSON.stringify(entry.payload || {}),
    PAYLOAD: JSON.stringify(entry.payload || {}),
    created_at: now,
    CREATED_AT: now,
  };

  var dedicated = WI_OP_APPEND_CTX_ && WI_OP_APPEND_CTX_.auditInfo
    ? WI_OP_APPEND_CTX_.auditInfo
    : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.ACTION_AUDIT_LOG);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditHeaderMs', Date.now() - headerStart);

  var writeStart = Date.now();
  if (dedicated.exists) {
    if (typeof wiOpAppendRowFast_ === 'function' && CBV_WI_OP_CONFIG.USE_SET_VALUES_APPEND) {
      wiOpAppendRowFast_(dedicated, record, {
        rowBuild: 'auditRowBuildMs',
        write: 'auditWriteMs',
        sheet: 'auditSheetMs',
      });
    } else if (typeof wiOpAppendRowWithInfo_ === 'function') {
      wiOpAppendRowWithInfo_(dedicated, record);
    } else {
      wiOpAppendRow_(CBV_WI_OP_CONFIG.SHEETS.ACTION_AUDIT_LOG, record);
    }
  } else {
    wiOpAppendOpStore_('ACTION_AUDIT_LOG', record.task_id, record);
    if (CBV_WI_OP_CONFIG.MIRROR_AUDIT_TO_LEGACY_LOG && typeof taskDbAppendAudit_ === 'function') {
      var mirrorStart = Date.now();
      taskDbAppendAudit_({
        traceId: record.trace_id,
        actor: record.actor,
        action: record.action,
        detail: {
          audit_id: auditId,
          task_id: record.task_id,
          actor_role: record.actor_role,
          before_state: record.before_state,
          after_state: record.after_state,
          payload: entry.payload || {},
        },
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditMirrorMs', Date.now() - mirrorStart);
    }
  }
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('auditWriteMs', Date.now() - writeStart);

  return { ok: true, auditId: auditId, server: true };
}

function wiOpAppendTimeline_(entry) {
  var headerStart = Date.now();
  var timelineId = wiOpMakeId_('TL');
  var now = wiOpNow_();
  var record = {
    timeline_id: timelineId,
    TIMELINE_ID: timelineId,
    task_id: String(entry.taskId || ''),
    TASK_ID: String(entry.taskId || ''),
    event_type: String(entry.eventType || ''),
    EVENT_TYPE: String(entry.eventType || ''),
    event_label: String(entry.eventLabel || entry.eventType || ''),
    EVENT_LABEL: String(entry.eventLabel || entry.eventType || ''),
    actor: String(entry.actor || ''),
    ACTOR: String(entry.actor || ''),
    payload: JSON.stringify(entry.payload || {}),
    PAYLOAD: JSON.stringify(entry.payload || {}),
    created_at: now,
    CREATED_AT: now,
  };

  var dedicated = WI_OP_APPEND_CTX_ && WI_OP_APPEND_CTX_.timelineInfo
    ? WI_OP_APPEND_CTX_.timelineInfo
    : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_TIMELINE);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineHeaderMs', Date.now() - headerStart);

  var writeStart = Date.now();
  if (dedicated.exists) {
    if (typeof wiOpAppendRowFast_ === 'function' && CBV_WI_OP_CONFIG.USE_SET_VALUES_APPEND) {
      wiOpAppendRowFast_(dedicated, record, {
        rowBuild: 'timelineRowBuildMs',
        write: 'timelineWriteMs',
        sheet: 'timelineSheetMs',
      });
    } else if (typeof wiOpAppendRowWithInfo_ === 'function') {
      wiOpAppendRowWithInfo_(dedicated, record);
    } else {
      wiOpAppendRow_(CBV_WI_OP_CONFIG.SHEETS.TASK_TIMELINE, record);
    }
  } else {
    wiOpAppendOpStore_('TASK_TIMELINE', record.task_id, record);
    if (CBV_WI_OP_CONFIG.MIRROR_TIMELINE_TO_LEGACY_LOG && typeof taskDbAppendUpdateLog_ === 'function') {
      var tlMirrorStart = Date.now();
      taskDbAppendUpdateLog_({
        taskId: record.task_id,
        updateType: 'OPERATIONAL_TIMELINE',
        action: record.event_type,
        actorId: record.actor,
        actorName: record.actor,
        note: record.event_label + ' ' + record.payload,
      });
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineMirrorMs', Date.now() - tlMirrorStart);
    }
  }
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('timelineWriteMs', Date.now() - writeStart);

  return { ok: true, timelineId: timelineId, server: true };
}

function wiOpGetTimelineForTask_(taskId, limit) {
  limit = limit || CBV_WI_OP_CONFIG.TIMELINE_LIMIT;
  var tailMax = CBV_WI_OP_CONFIG.TAIL_SCAN_MAX || 250;
  var dedicated = WI_OP_APPEND_CTX_
    ? WI_OP_APPEND_CTX_.timelineInfo
    : taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_TIMELINE);
  var events = [];
  var rowsScanned = 0;
  var fastPathUsed = false;

  if (dedicated.exists) {
    var sheet = dedicated.sheet;
    var tail =
      typeof wiOpReadSheetTailValues_ === 'function'
        ? wiOpReadSheetTailValues_(sheet, tailMax)
        : null;
    var values = tail ? tail.values : [];
    rowsScanned = tail ? tail.rowsScanned : 0;
    if (tail) fastPathUsed = true;
    if (!tail) {
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        var lastCol = Math.max(sheet.getLastColumn(), 1);
        values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
        rowsScanned = values.length;
      }
    }
    for (var i = values.length - 1; i >= 0 && events.length < limit; i--) {
      var rec = taskDbRowToRecord_(dedicated.headerMap, values[i]);
      if (String(rec.TASK_ID || rec.task_id) !== String(taskId)) continue;
      events.push({
        timelineId: String(rec.TIMELINE_ID || rec.timeline_id || ''),
        taskId: String(rec.TASK_ID || rec.task_id || ''),
        eventType: String(rec.EVENT_TYPE || rec.event_type || ''),
        eventLabel: String(rec.EVENT_LABEL || rec.event_label || ''),
        actor: String(rec.ACTOR || rec.actor || ''),
        payload: rec.PAYLOAD || rec.payload || '{}',
        createdAt: String(rec.CREATED_AT || rec.created_at || ''),
        source: 'TASK_TIMELINE',
      });
    }
  }

  if (events.length === 0) {
    var store = wiOpReadOpStore_('TASK_TIMELINE', taskId, limit);
    store.forEach(function (s) {
      var p = s.payload || {};
      events.push({
        timelineId: p.timeline_id || s.id,
        taskId: s.taskId,
        eventType: p.event_type || p.EVENT_TYPE || '',
        eventLabel: p.event_label || p.EVENT_LABEL || '',
        actor: p.actor || p.ACTOR || '',
        payload: typeof p.payload === 'string' ? p.payload : JSON.stringify(p.payload || p),
        createdAt: s.createdAt,
        source: 'WORK_INBOX_OP_STORE',
      });
    });
  }

  if (events.length === 0 && typeof taskDbGetTimelineForTask_ === 'function') {
    var legacy = taskDbGetTimelineForTask_(taskId);
    legacy.forEach(function (e) {
      events.push({
        timelineId: e.resourceId || '',
        taskId: taskId,
        eventType: e.action || 'LEGACY',
        eventLabel: e.message || e.action || '',
        actor: e.actor || '',
        payload: '{}',
        createdAt: e.time || '',
        source: e.source || 'TASK_UPDATE_LOG',
      });
    });
  }

  events.sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
  if (typeof wiPerfMarkPhase_ === 'function') {
    wiPerfMarkPhase_('timelineRowsScanned', rowsScanned);
    if (fastPathUsed) wiPerfMarkPhase_('timelineFastPathUsed', 1);
  }
  return events.slice(0, limit);
}

function wiOpCreateAppointment_(taskId, data, actor) {
  var appointmentId = wiOpMakeId_('APT');
  var now = wiOpNow_();
  var startAt = data.startAt || data.start_at || now;
  var endAt = data.endAt || data.end_at || startAt;
  var record = {
    appointment_id: appointmentId,
    APPOINTMENT_ID: appointmentId,
    task_id: String(taskId),
    TASK_ID: String(taskId),
    title: String(data.title || 'Lịch hẹn'),
    TITLE: String(data.title || 'Lịch hẹn'),
    description: String(data.description || ''),
    DESCRIPTION: String(data.description || ''),
    start_at: startAt,
    START_AT: startAt,
    end_at: endAt,
    END_AT: endAt,
    created_by: actor.userId || actor.displayName || '',
    CREATED_BY: actor.userId || actor.displayName || '',
    status: 'SCHEDULED',
    STATUS: 'SCHEDULED',
    created_at: now,
    CREATED_AT: now,
  };

  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_APPOINTMENTS);
  if (dedicated.exists) {
    wiOpAppendRow_(CBV_WI_OP_CONFIG.SHEETS.TASK_APPOINTMENTS, record);
  } else {
    wiOpAppendOpStore_('TASK_APPOINTMENTS', taskId, record);
  }

  return { ok: true, appointment: record };
}

function wiOpListAppointments_(taskId, limit) {
  limit = limit || CBV_WI_OP_CONFIG.PREVIEW_LIMIT;
  var out = [];
  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_APPOINTMENTS);
  if (dedicated.exists) {
    var sheet = dedicated.sheet;
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var lastCol = Math.max(sheet.getLastColumn(), 1);
      var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
      for (var i = values.length - 1; i >= 0 && out.length < limit; i--) {
        var rec = taskDbRowToRecord_(dedicated.headerMap, values[i]);
        if (String(rec.TASK_ID || rec.task_id) !== String(taskId)) continue;
        out.push({
          appointmentId: String(rec.APPOINTMENT_ID || rec.appointment_id || ''),
          taskId: String(rec.TASK_ID || rec.task_id || ''),
          title: String(rec.TITLE || rec.title || ''),
          description: String(rec.DESCRIPTION || rec.description || ''),
          startAt: String(rec.START_AT || rec.start_at || ''),
          endAt: String(rec.END_AT || rec.end_at || ''),
          createdBy: String(rec.CREATED_BY || rec.created_by || ''),
          status: String(rec.STATUS || rec.status || ''),
          createdAt: String(rec.CREATED_AT || rec.created_at || ''),
        });
      }
    }
  }
  if (out.length === 0) {
    wiOpReadOpStore_('TASK_APPOINTMENTS', taskId, limit).forEach(function (s) {
      var p = s.payload || {};
      out.push({
        appointmentId: p.appointment_id || s.id,
        taskId: s.taskId,
        title: p.title || p.TITLE || '',
        description: p.description || p.DESCRIPTION || '',
        startAt: p.start_at || p.START_AT || '',
        endAt: p.end_at || p.END_AT || '',
        createdBy: p.created_by || p.CREATED_BY || '',
        status: p.status || p.STATUS || 'SCHEDULED',
        createdAt: s.createdAt,
      });
    });
  }
  out.sort(function (a, b) { return String(a.startAt).localeCompare(String(b.startAt)); });
  return out;
}

function wiOpSaveNote_(taskId, content, actor) {
  var noteId = wiOpMakeId_('NOTE');
  var now = wiOpNow_();
  var record = {
    note_id: noteId,
    NOTE_ID: noteId,
    task_id: String(taskId),
    TASK_ID: String(taskId),
    content: String(content || '').trim(),
    CONTENT: String(content || '').trim(),
    author: actor.userId || actor.displayName || '',
    AUTHOR: actor.userId || actor.displayName || '',
    created_at: now,
    CREATED_AT: now,
  };
  if (!record.content) return { ok: false, message: 'Nội dung ghi chú trống' };

  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_NOTES);
  if (dedicated.exists) {
    wiOpAppendRow_(CBV_WI_OP_CONFIG.SHEETS.TASK_NOTES, record);
  } else {
    wiOpAppendOpStore_('TASK_NOTES', taskId, record);
  }
  return { ok: true, note: record };
}

function wiOpListNotes_(taskId, limit) {
  limit = limit || 10;
  var out = [];
  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_NOTES);
  if (dedicated.exists) {
    var sheet = dedicated.sheet;
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var lastCol = Math.max(sheet.getLastColumn(), 1);
      var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
      for (var i = values.length - 1; i >= 0 && out.length < limit; i--) {
        var rec = taskDbRowToRecord_(dedicated.headerMap, values[i]);
        if (String(rec.TASK_ID || rec.task_id) !== String(taskId)) continue;
        out.push({
          noteId: String(rec.NOTE_ID || rec.note_id || ''),
          taskId: String(rec.TASK_ID || rec.task_id || ''),
          content: String(rec.CONTENT || rec.content || ''),
          author: String(rec.AUTHOR || rec.author || ''),
          createdAt: String(rec.CREATED_AT || rec.created_at || ''),
        });
      }
    }
  }
  if (out.length === 0) {
    wiOpReadOpStore_('TASK_NOTES', taskId, limit).forEach(function (s) {
      var p = s.payload || {};
      out.push({
        noteId: p.note_id || s.id,
        taskId: s.taskId,
        content: p.content || p.CONTENT || '',
        author: p.author || p.AUTHOR || '',
        createdAt: s.createdAt,
      });
    });
  }
  return out;
}

function wiOpAddDocument_(taskId, data, actor) {
  var documentId = wiOpMakeId_('DOC');
  var now = wiOpNow_();
  var record = {
    document_id: documentId,
    DOCUMENT_ID: documentId,
    task_id: String(taskId),
    TASK_ID: String(taskId),
    title: String(data.title || 'Tài liệu'),
    TITLE: String(data.title || 'Tài liệu'),
    url: String(data.url || ''),
    URL: String(data.url || ''),
    uploaded_by: actor.userId || actor.displayName || '',
    UPLOADED_BY: actor.userId || actor.displayName || '',
    uploaded_at: now,
    UPLOADED_AT: now,
  };

  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_DOCUMENTS);
  if (dedicated.exists) {
    wiOpAppendRow_(CBV_WI_OP_CONFIG.SHEETS.TASK_DOCUMENTS, record);
  } else {
    wiOpAppendOpStore_('TASK_DOCUMENTS', taskId, record);
  }

  return { ok: true, document: record };
}

function wiOpListDocuments_(taskId, limit) {
  limit = limit || CBV_WI_OP_CONFIG.PREVIEW_LIMIT;
  var tailMax = CBV_WI_OP_CONFIG.TAIL_SCAN_MAX || 250;
  var out = [];
  var rowsScanned = 0;
  var documentsSkipped = false;
  var fastPathUsed = false;

  if (typeof taskDbGetAttachmentsForTask_ === 'function') {
    var files = taskDbGetAttachmentsForTask_(taskId);
    files.forEach(function (f) {
      out.push({
        documentId: f.fileId,
        taskId: taskId,
        title: f.fileName,
        url: '',
        uploadedBy: f.createdBy || '',
        uploadedAt: f.createdAt || '',
        source: 'TASK_ATTACHMENT',
      });
    });
    if (files.length > 0) {
      if (typeof wiPerfMarkPhase_ === 'function') {
        wiPerfMarkPhase_('documentsFastPathUsed', 1);
        wiPerfMarkPhase_('documentsRowsScanned', files.length);
      }
      out.sort(function (a, b) { return String(b.uploadedAt).localeCompare(String(a.uploadedAt)); });
      return out.slice(0, limit);
    }
  }

  var dedicated = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_DOCUMENTS);
  if (dedicated.exists) {
    var sheet = dedicated.sheet;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      documentsSkipped = true;
      if (typeof wiPerfMarkPhase_ === 'function') {
        wiPerfMarkPhase_('documentsSkipped', 1);
        wiPerfMarkPhase_('documentsFastPathUsed', 1);
      }
      return [];
    }
    var tail =
      typeof wiOpReadSheetTailValues_ === 'function'
        ? wiOpReadSheetTailValues_(sheet, tailMax)
        : null;
    var values = tail ? tail.values : [];
    rowsScanned = tail ? tail.rowsScanned : 0;
    if (tail) fastPathUsed = true;
    if (!tail && lastRow >= 2) {
      var lastCol = Math.max(sheet.getLastColumn(), 1);
      values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
      rowsScanned = values.length;
    }
    for (var i = values.length - 1; i >= 0 && out.length < limit * 2; i--) {
      var rec = taskDbRowToRecord_(dedicated.headerMap, values[i]);
      if (String(rec.TASK_ID || rec.task_id) !== String(taskId)) continue;
      out.push({
        documentId: String(rec.DOCUMENT_ID || rec.document_id || ''),
        taskId: String(rec.TASK_ID || rec.task_id || ''),
        title: String(rec.TITLE || rec.title || ''),
        url: String(rec.URL || rec.url || ''),
        uploadedBy: String(rec.UPLOADED_BY || rec.uploaded_by || ''),
        uploadedAt: String(rec.UPLOADED_AT || rec.uploaded_at || ''),
        source: 'TASK_DOCUMENTS',
      });
    }
    if (out.length >= limit) {
      if (typeof wiPerfMarkPhase_ === 'function') {
        wiPerfMarkPhase_('documentsRowsScanned', rowsScanned);
        if (fastPathUsed) wiPerfMarkPhase_('documentsFastPathUsed', 1);
      }
      out.sort(function (a, b) { return String(b.uploadedAt).localeCompare(String(a.uploadedAt)); });
      return out.slice(0, limit);
    }
  } else {
    documentsSkipped = true;
  }

  if (!documentsSkipped && out.length < limit) {
    wiOpReadOpStore_('TASK_DOCUMENTS', taskId, limit).forEach(function (s) {
      var p = s.payload || {};
      out.push({
        documentId: p.document_id || s.id,
        taskId: s.taskId,
        title: p.title || p.TITLE || '',
        url: p.url || p.URL || '',
        uploadedBy: p.uploaded_by || p.UPLOADED_BY || '',
        uploadedAt: s.createdAt,
        source: 'WORK_INBOX_OP_STORE',
      });
    });
  } else if (documentsSkipped && out.length === 0) {
    if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('documentsSkipped', 1);
  }

  if (typeof wiPerfMarkPhase_ === 'function') {
    wiPerfMarkPhase_('documentsRowsScanned', rowsScanned);
    if (fastPathUsed) wiPerfMarkPhase_('documentsFastPathUsed', 1);
  }
  out.sort(function (a, b) { return String(b.uploadedAt).localeCompare(String(a.uploadedAt)); });
  return out.slice(0, limit);
}

function wiOpLookupSop_(context) {
  var module = String(context.module || 'WORK_INBOX').toUpperCase();
  var taskType = String(context.taskType || context.status || 'TASK').toUpperCase();
  var list = CBV_WI_OP_CONFIG.SOP_REGISTRY || [];
  var hit =
    list.find(function (s) { return s.active && String(s.code).toUpperCase() === taskType; }) ||
    list.find(function (s) { return s.active && String(s.code).toUpperCase() === module; }) ||
    list.find(function (s) { return s.active && String(s.category).toUpperCase() === 'MODULE'; });
  return hit || null;
}

function wiOpListFormTemplates_(category) {
  var cat = String(category || '').toUpperCase();
  var list = CBV_WI_OP_CONFIG.FORM_TEMPLATE_REGISTRY || [];
  if (!cat) return list.filter(function (t) { return t.active; });
  return list.filter(function (t) {
    return t.active && String(t.category || '').toUpperCase() === cat;
  });
}

function wiOpGetTaskOperational_(taskId) {
  var timeline = typeof wiPerfRunTimed_ === 'function'
    ? wiPerfRunTimed_('bundleTimelineMs', function () {
        return wiOpGetTimelineForTask_(taskId, CBV_WI_OP_CONFIG.TIMELINE_LIMIT);
      })
    : wiOpGetTimelineForTask_(taskId, CBV_WI_OP_CONFIG.TIMELINE_LIMIT);
  var appointments = typeof wiPerfRunTimed_ === 'function'
    ? wiPerfRunTimed_('bundleAppointmentsMs', function () {
        return wiOpListAppointments_(taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
      })
    : wiOpListAppointments_(taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
  var notes = typeof wiPerfRunTimed_ === 'function'
    ? wiPerfRunTimed_('bundleNotesMs', function () {
        return wiOpListNotes_(taskId, 10);
      })
    : wiOpListNotes_(taskId, 10);
  var documents = typeof wiPerfRunTimed_ === 'function'
    ? wiPerfRunTimed_('bundleDocumentsMs', function () {
        return wiOpListDocuments_(taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
      })
    : wiOpListDocuments_(taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
  var audits = typeof wiPerfRunTimed_ === 'function'
    ? wiPerfRunTimed_('bundleAuditsMs', function () {
        return wiOpReadOpStore_('ACTION_AUDIT_LOG', taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
      })
    : wiOpReadOpStore_('ACTION_AUDIT_LOG', taskId, CBV_WI_OP_CONFIG.PREVIEW_LIMIT);
  return {
    taskId: taskId,
    timeline: timeline,
    appointments: appointments,
    notes: notes,
    documents: documents,
    audits: audits,
  };
}

function CBV_WiOp_isRegisteredAction(action) {
  return CBV_WI_OP_ACTIONS.indexOf(String(action || '').trim()) >= 0;
}

function wiOpHandleAction_(action, payload, actor, traceId) {
  action = String(action || '').trim();
  if (action === 'wiOpRecordAction' && typeof wiOpHandleRecordAction_ === 'function') {
    return wiOpHandleRecordAction_(action, payload, actor, traceId);
  }
  if (!CBV_WiOp_isRegisteredAction(action)) return null;

  switch (action) {
    case 'wiOpAppendActionAudit':
      if (!payload.taskId || !payload.action) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId hoặc action'] });
      }
      return taskDbBuildResponse_(action, wiOpAppendActionAudit_(payload), { traceId: traceId });

    case 'wiOpAppendTimeline':
      if (!payload.taskId || !payload.eventType) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId hoặc eventType'] });
      }
      return taskDbBuildResponse_(action, wiOpAppendTimeline_(payload), { traceId: traceId });

    case 'wiOpGetTaskOperational':
      if (!payload.taskId) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId'] });
      }
      return taskDbBuildResponse_(action, wiOpGetTaskOperational_(payload.taskId), { traceId: traceId });

    case 'wiOpCreateAppointment': {
      if (!payload.taskId) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId'] });
      }
      var apt = wiOpCreateAppointment_(payload.taskId, payload, actor);
      if (!apt.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [apt.message] });
      }
      return taskDbBuildResponse_(action, apt, { traceId: traceId });
    }

    case 'wiOpSaveNote': {
      if (!payload.taskId || !payload.content) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId hoặc content'] });
      }
      var noteRes = wiOpSaveNote_(payload.taskId, payload.content, actor);
      if (!noteRes.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [noteRes.message] });
      }
      return taskDbBuildResponse_(action, noteRes, { traceId: traceId });
    }

    case 'wiOpAddDocument': {
      if (!payload.taskId) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Thiếu taskId'] });
      }
      return taskDbBuildResponse_(action, wiOpAddDocument_(payload.taskId, payload, actor), { traceId: traceId });
    }

    case 'wiOpLookupSop':
      return taskDbBuildResponse_(action, { sop: wiOpLookupSop_(payload || {}) }, { traceId: traceId });

    case 'wiOpListFormTemplates':
      return taskDbBuildResponse_(
        action,
        { templates: wiOpListFormTemplates_(payload && payload.category) },
        { traceId: traceId },
      );

    case 'wiOpCreateUserTask': {
      if (typeof wiOpCreateUserTask_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Create task handler missing'] });
      }
      var createRes = wiOpCreateUserTask_(payload, actor, traceId);
      if (!createRes.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [createRes.message || 'Không tạo được việc'] });
      }
      return taskDbBuildResponse_(action, createRes, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpListChecklist': {
      if (typeof wiOpListChecklist_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Checklist list handler missing'] });
      }
      var listRes = wiOpListChecklist_(payload.taskId);
      if (!listRes.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [listRes.message || 'Không tải checklist'] });
      }
      return taskDbBuildResponse_(action, listRes, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpCreateChecklistItem': {
      if (typeof wiOpCreateChecklistItem_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Checklist create handler missing'] });
      }
      var clCreate = wiOpCreateChecklistItem_(payload, actor, traceId);
      if (!clCreate.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [clCreate.message || 'Không tạo mục checklist'] });
      }
      return taskDbBuildResponse_(action, clCreate, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpUpdateChecklistItem': {
      if (typeof wiOpUpdateChecklistItem_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Checklist update handler missing'] });
      }
      var clUpdate = wiOpUpdateChecklistItem_(payload, actor, traceId);
      if (!clUpdate.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [clUpdate.message || 'Không cập nhật mục checklist'] });
      }
      return taskDbBuildResponse_(action, clUpdate, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpToggleChecklistItem': {
      if (typeof wiOpToggleChecklistItem_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Checklist toggle handler missing'] });
      }
      var clToggle = wiOpToggleChecklistItem_(payload, actor, traceId);
      if (!clToggle.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [clToggle.message || 'Không đổi trạng thái checklist'] });
      }
      return taskDbBuildResponse_(action, clToggle, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpSoftDeleteChecklistItem': {
      if (typeof wiOpSoftDeleteChecklistItem_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Checklist delete handler missing'] });
      }
      var clDelete = wiOpSoftDeleteChecklistItem_(payload, actor, traceId);
      if (!clDelete.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [clDelete.message || 'Không xóa mục checklist'] });
      }
      return taskDbBuildResponse_(action, clDelete, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpListAttachments': {
      if (typeof wiOpListAttachments_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Attachments list handler missing'] });
      }
      var attList = wiOpListAttachments_(payload.taskId);
      if (!attList.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [attList.message || 'Không tải tài liệu'] });
      }
      return taskDbBuildResponse_(action, attList, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpCreateAttachment': {
      if (typeof wiOpCreateAttachment_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Attachment create handler missing'] });
      }
      var attCreate = wiOpCreateAttachment_(payload, actor, traceId);
      if (!attCreate.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [attCreate.message || 'Không tạo tài liệu'] });
      }
      return taskDbBuildResponse_(action, attCreate, { traceId: traceId, code: 'OK', warnings: attCreate.warnings || [] });
    }

    case 'wiOpUpdateAttachment': {
      if (typeof wiOpUpdateAttachment_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Attachment update handler missing'] });
      }
      var attUpdate = wiOpUpdateAttachment_(payload, actor, traceId);
      if (!attUpdate.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [attUpdate.message || 'Không cập nhật tài liệu'] });
      }
      return taskDbBuildResponse_(action, attUpdate, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpSoftDeleteAttachment': {
      if (typeof wiOpSoftDeleteAttachment_ !== 'function') {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: ['Attachment delete handler missing'] });
      }
      var attDelete = wiOpSoftDeleteAttachment_(payload, actor, traceId);
      if (!attDelete.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, errors: [attDelete.message || 'Không xóa tài liệu'] });
      }
      return taskDbBuildResponse_(action, attDelete, { traceId: traceId, code: 'OK' });
    }

    case 'wiOpClBridge': {
      if (typeof clBridgeDispatch_ !== 'function') {
        return taskDbBuildResponse_(action, null, {
          traceId: traceId,
          ok: false,
          errors: ['Checklist Sheet/Drive bridge missing'],
        });
      }
      var bridgeMethod = String(payload.method || '').trim();
      var bridgeRes = clBridgeDispatch_(bridgeMethod, payload, actor, traceId);
      if (!bridgeRes.ok) {
        return taskDbBuildResponse_(action, bridgeRes.data, {
          traceId: bridgeRes.traceId || traceId,
          ok: false,
          errors: bridgeRes.errors && bridgeRes.errors.length ? bridgeRes.errors : [bridgeRes.message || 'Bridge failed'],
          warnings: bridgeRes.warnings || [],
        });
      }
      return taskDbBuildResponse_(action, bridgeRes.data, {
        traceId: bridgeRes.traceId || traceId,
        code: bridgeRes.status === 'GO_WITH_WARNINGS' ? 'OK' : 'OK',
        warnings: bridgeRes.warnings || [],
      });
    }

    case 'wiOpClBridgeValidate': {
      if (typeof validateChecklistSheetDriveBridge !== 'function') {
        return taskDbBuildResponse_(action, null, {
          traceId: traceId,
          ok: false,
          errors: ['validateChecklistSheetDriveBridge missing'],
        });
      }
      var valBridge = validateChecklistSheetDriveBridge(payload || {});
      return taskDbBuildResponse_(action, valBridge, {
        traceId: valBridge.traceId || traceId,
        ok: !!valBridge.ok,
        warnings: valBridge.warnings || [],
        errors: valBridge.errors || [],
      });
    }

    case 'checklist.schema.bootstrap': {
      if (typeof CBV_TCS_CHECKLIST_09_bootstrapSchema !== 'function' && typeof bootstrapChecklistSheetSchema !== 'function') {
        return taskDbBuildResponse_(action, null, {
          traceId: traceId,
          ok: false,
          errors: ['checklist schema bootstrap handler missing'],
        });
      }
      var schemaBootstrap = typeof CBV_TCS_CHECKLIST_09_bootstrapSchema === 'function'
        ? CBV_TCS_CHECKLIST_09_bootstrapSchema()
        : bootstrapChecklistSheetSchema({});
      return taskDbBuildResponse_(action, schemaBootstrap, {
        traceId: traceId,
        ok: !!(schemaBootstrap && schemaBootstrap.ok),
        warnings: (schemaBootstrap && schemaBootstrap.warnings) || [],
        errors: (schemaBootstrap && schemaBootstrap.errors) || [],
      });
    }

    case 'checklist.schema.validate': {
      if (typeof CBV_TCS_CHECKLIST_09_validateSchema !== 'function' && typeof validateChecklistSheetSchema !== 'function') {
        return taskDbBuildResponse_(action, null, {
          traceId: traceId,
          ok: false,
          errors: ['checklist schema validate handler missing'],
        });
      }
      var schemaValidate = typeof CBV_TCS_CHECKLIST_09_validateSchema === 'function'
        ? CBV_TCS_CHECKLIST_09_validateSchema()
        : validateChecklistSheetSchema({});
      return taskDbBuildResponse_(action, schemaValidate, {
        traceId: traceId,
        ok: !!(schemaValidate && schemaValidate.ok),
        warnings: (schemaValidate && schemaValidate.warnings) || [],
        errors: (schemaValidate && schemaValidate.errors) || [],
      });
    }

    default:
      return null;
  }
}
