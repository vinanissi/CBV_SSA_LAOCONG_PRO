/**
 * PHASE_CHECKLIST_11 — Sheet/Drive bridge for checklist satellite persistence.
 * Non-destructive: append-only feedback/history; upsert by id for attachments/links/layout.
 * Items delegate to existing TASK_CHECKLIST handlers (49_WorkInboxChecklist.js).
 */

var CL_BRIDGE_SCHEMA_VERSION_ = '1';
var CL_BRIDGE_SOURCE_ = 'checklist_bridge_v1';

function clBridgeNowIso_() {
  if (typeof taskDbNowIso_ === 'function') return taskDbNowIso_();
  return new Date().toISOString();
}

function clBridgeTraceId_(payload, traceId) {
  return String(traceId || (payload && payload.traceId) || '').trim() || taskDbMakeId_('TRC');
}

function clBridgeActorLabel_(actor) {
  return (actor && (actor.displayName || actor.userId || actor.email)) || 'OPERATOR';
}

function clBridgeResult_(ok, status, traceId, data, message, warnings, errors) {
  return {
    ok: !!ok,
    status: status || (ok ? 'GO' : 'FAIL'),
    traceId: traceId,
    message: message || '',
    data: data !== undefined ? data : null,
    warnings: warnings || [],
    errors: errors || [],
  };
}

function clBridgeIsTruthy_(val) {
  return val === true || String(val).toLowerCase() === 'true' || String(val) === '1';
}

function clBridgeNormalizeRecord_(record) {
  var out = {};
  Object.keys(record || {}).forEach(function (k) {
    out[String(k).toUpperCase()] = record[k];
  });
  return out;
}

function clBridgeEnsureSatelliteSheet_(sheetName) {
  var info = taskDbReadHeaders_(sheetName);
  if (info.exists) return info;
  if (typeof bootstrapChecklistSheetSchema === 'function') {
    bootstrapChecklistSheetSchema({});
    info = taskDbReadHeaders_(sheetName);
  }
  return info;
}

function clBridgeAppendRecord_(sheetName, record) {
  var info = clBridgeEnsureSatelliteSheet_(sheetName);
  if (!info.exists) {
    return { ok: false, error: 'Sheet unavailable: ' + sheetName };
  }
  var sheet = info.sheet;
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var normalized = clBridgeNormalizeRecord_(record);
  var dense = [];
  for (var i = 0; i < headerRow.length; i++) {
    var col = String(headerRow[i] || '').trim().toUpperCase();
    dense.push(col && normalized[col] !== undefined ? normalized[col] : '');
  }
  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, dense.length).setValues([dense]);
  return { ok: true, rowNumber: nextRow };
}

function clBridgeReadAllRows_(sheetName) {
  var info = clBridgeEnsureSatelliteSheet_(sheetName);
  if (!info.exists) return { info: info, rows: [] };
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { info: info, rows: [] };
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headerRow.forEach(function (cell, idx) {
    var name = String(cell || '').trim().toUpperCase();
    if (name) map[name] = idx;
  });
  var rows = [];
  for (var r = 0; r < values.length; r++) {
    var rec = {};
    Object.keys(map).forEach(function (col) {
      rec[col] = values[r][map[col]];
    });
    rec._rowNumber = r + 2;
    rows.push(rec);
  }
  return { info: info, rows: rows };
}

function clBridgeFindRowById_(sheetName, idColumn, idValue) {
  var read = clBridgeReadAllRows_(sheetName);
  for (var i = 0; i < read.rows.length; i++) {
    if (String(read.rows[i][idColumn]) === String(idValue)) {
      return { info: read.info, record: read.rows[i], rowNumber: read.rows[i]._rowNumber };
    }
  }
  return null;
}

function clBridgePatchRow_(found, patch) {
  var sheet = found.info.sheet;
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headerRow.forEach(function (cell, idx) {
    var name = String(cell || '').trim().toUpperCase();
    if (name) map[name] = idx;
  });
  Object.keys(patch).forEach(function (col) {
    var key = col.toUpperCase();
    if (map[key] !== undefined) {
      sheet.getRange(found.rowNumber, map[key] + 1).setValue(patch[key]);
    }
  });
}

function clBridgeAppendHistory_(taskId, checklistItemId, eventType, message, actor, refId, refType, metadata, traceId) {
  var historyId = taskDbMakeId_('CLH');
  var rec = {
    HISTORY_ID: historyId,
    CHECKLIST_ITEM_ID: checklistItemId,
    TASK_ID: taskId,
    EVENT_TYPE: eventType,
    MESSAGE: message,
    ACTOR: actor,
    CREATED_AT: clBridgeNowIso_(),
    SOURCE: CL_BRIDGE_SOURCE_,
    REF_ID: refId || '',
    REF_TYPE: refType || '',
    METADATA_JSON: metadata ? JSON.stringify(metadata) : '',
    SCHEMA_VERSION: CL_BRIDGE_SCHEMA_VERSION_,
  };
  var append = clBridgeAppendRecord_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_HISTORY, rec);
  if (!append.ok) return append;
  return { ok: true, historyId: historyId, record: rec };
}

function clBridgeReadChecklistItems_(taskId, traceId) {
  if (!String(taskId || '').trim()) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId is required', [], ['taskId is required']);
  }
  if (typeof wiOpListChecklist_ !== 'function') {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Checklist handler missing', [], ['wiOpListChecklist_ missing']);
  }
  var res = wiOpListChecklist_(taskId);
  if (!res.ok) {
    return clBridgeResult_(false, 'FAIL', traceId, null, res.message, [], [res.message]);
  }
  return clBridgeResult_(true, 'GO', traceId, { items: res.items || [] }, '', res.warnings || [], []);
}

function clBridgeUpsertChecklistItem_(payload, actor, traceId) {
  payload = payload || {};
  var checklistId = String(payload.checklistId || payload.checklist_item_id || '').trim();
  if (checklistId) {
    if (typeof wiOpUpdateChecklistItem_ !== 'function') {
      return clBridgeResult_(false, 'FAIL', traceId, null, 'Update handler missing', [], []);
    }
    var upd = wiOpUpdateChecklistItem_(payload, actor, traceId);
    if (!upd.ok) {
      return clBridgeResult_(false, 'FAIL', traceId, null, upd.message, [], [upd.message]);
    }
    clBridgeAppendHistory_(
      String(upd.item.taskId),
      checklistId,
      'checklist_item_upserted',
      'Cập nhật mục checklist',
      clBridgeActorLabel_(actor),
      checklistId,
      'checklist',
      { title: upd.item.title },
      traceId,
    );
    return clBridgeResult_(true, 'GO', traceId, { item: upd.item }, '', upd.warnings || [], []);
  }
  if (typeof wiOpCreateChecklistItem_ !== 'function') {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Create handler missing', [], []);
  }
  var created = wiOpCreateChecklistItem_(payload, actor, traceId);
  if (!created.ok) {
    return clBridgeResult_(false, 'FAIL', traceId, null, created.message, [], [created.message]);
  }
  clBridgeAppendHistory_(
    String(created.item.taskId),
    String(created.item.checklistId),
    'checklist_item_upserted',
    'Tạo mục checklist',
    clBridgeActorLabel_(actor),
    created.item.checklistId,
    'checklist',
    { title: created.item.title },
    traceId,
  );
  return clBridgeResult_(true, 'GO', traceId, { item: created.item }, '', created.warnings || [], []);
}

function clBridgeMapFeedbackFe_(rec) {
  return {
    id: String(rec.FEEDBACK_ID || ''),
    checklistItemId: String(rec.CHECKLIST_ITEM_ID || ''),
    taskId: String(rec.TASK_ID || ''),
    message: String(rec.MESSAGE || ''),
    author: String(rec.AUTHOR || '') || null,
    createdAt: String(rec.CREATED_AT || '') || null,
    source: String(rec.SOURCE || '') || null,
  };
}

function clBridgeReadFeedback_(payload, traceId) {
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var taskId = String(payload.taskId || '').trim();
  var sheet = CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_FEEDBACK;
  var rows = clBridgeReadAllRows_(sheet).rows;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var rec = rows[i];
    if (checklistItemId && String(rec.CHECKLIST_ITEM_ID) !== checklistItemId) continue;
    if (taskId && String(rec.TASK_ID) !== taskId) continue;
    out.push(clBridgeMapFeedbackFe_(rec));
  }
  out.sort(function (a, b) {
    return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  });
  return clBridgeResult_(true, 'GO', traceId, { feedback: out }, '', [], []);
}

function clBridgeAppendFeedback_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var message = String(payload.message || '').trim();
  if (!taskId || !checklistItemId || !message) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId, checklistItemId, message required', [], []);
  }
  var feedbackId = String(payload.id || payload.feedbackId || '').trim() || taskDbMakeId_('CLF');
  var rec = {
    FEEDBACK_ID: feedbackId,
    CHECKLIST_ITEM_ID: checklistItemId,
    TASK_ID: taskId,
    MESSAGE: message,
    AUTHOR: String(payload.author || clBridgeActorLabel_(actor)),
    CREATED_AT: String(payload.createdAt || clBridgeNowIso_()),
    SOURCE: String(payload.source || CL_BRIDGE_SOURCE_),
    SCHEMA_VERSION: CL_BRIDGE_SCHEMA_VERSION_,
  };
  var append = clBridgeAppendRecord_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_FEEDBACK, rec);
  if (!append.ok) {
    return clBridgeResult_(false, 'FAIL', traceId, null, append.error, [], [append.error]);
  }
  clBridgeAppendHistory_(taskId, checklistItemId, 'feedback_persisted', message, rec.AUTHOR, feedbackId, 'feedback', {}, traceId);
  return clBridgeResult_(true, 'GO', traceId, { feedback: clBridgeMapFeedbackFe_(rec) }, '', [], []);
}

function clBridgeMapAttachmentFe_(rec) {
  var driveUrl = String(rec.DRIVE_URL || '');
  var url = driveUrl || '';
  return {
    id: String(rec.ATTACHMENT_ID || ''),
    checklistItemId: String(rec.CHECKLIST_ITEM_ID || ''),
    taskId: String(rec.TASK_ID || ''),
    name: String(rec.FILE_NAME || ''),
    url: url || null,
    driveFileId: String(rec.DRIVE_FILE_ID || '') || null,
    mimeType: String(rec.MIME_TYPE || '') || null,
    size: rec.SIZE !== '' && rec.SIZE != null ? Number(rec.SIZE) : null,
    source: String(rec.SOURCE || '') || null,
    createdBy: String(rec.CREATED_BY || '') || null,
    createdAt: String(rec.CREATED_AT || '') || null,
  };
}

function clBridgeReadAttachmentMetadata_(payload, traceId) {
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var taskId = String(payload.taskId || '').trim();
  var sheet = CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_ATTACHMENTS;
  var rows = clBridgeReadAllRows_(sheet).rows;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var rec = rows[i];
    if (checklistItemId && String(rec.CHECKLIST_ITEM_ID) !== checklistItemId) continue;
    if (taskId && String(rec.TASK_ID) !== taskId) continue;
    out.push(clBridgeMapAttachmentFe_(rec));
  }
  return clBridgeResult_(true, 'GO', traceId, { attachments: out }, '', [], []);
}

function clBridgeAppendAttachmentMetadata_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var name = String(payload.name || payload.fileName || '').trim();
  if (!taskId || !checklistItemId || !name) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId, checklistItemId, name required', [], []);
  }
  var attachmentId = String(payload.id || payload.attachmentId || '').trim() || taskDbMakeId_('CLA');
  var rec = {
    ATTACHMENT_ID: attachmentId,
    CHECKLIST_ITEM_ID: checklistItemId,
    TASK_ID: taskId,
    FILE_NAME: name,
    DRIVE_FILE_ID: String(payload.driveFileId || payload.drive_file_id || ''),
    DRIVE_URL: String(payload.url || payload.driveUrl || ''),
    MIME_TYPE: String(payload.mimeType || ''),
    SIZE: payload.size != null ? payload.size : '',
    SOURCE: String(payload.source || CL_BRIDGE_SOURCE_),
    CREATED_BY: String(payload.createdBy || clBridgeActorLabel_(actor)),
    CREATED_AT: String(payload.createdAt || clBridgeNowIso_()),
    SCHEMA_VERSION: CL_BRIDGE_SCHEMA_VERSION_,
  };
  var existing = clBridgeFindRowById_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_ATTACHMENTS, 'ATTACHMENT_ID', attachmentId);
  if (existing) {
    clBridgePatchRow_(existing, rec);
  } else {
    var append = clBridgeAppendRecord_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_ATTACHMENTS, rec);
    if (!append.ok) {
      return clBridgeResult_(false, 'FAIL', traceId, null, append.error, [], [append.error]);
    }
  }
  clBridgeAppendHistory_(
    taskId,
    checklistItemId,
    'attachment_metadata_persisted',
    'Đính kèm: ' + name,
    rec.CREATED_BY,
    attachmentId,
    'attachment',
    { driveFileId: rec.DRIVE_FILE_ID },
    traceId,
  );
  return clBridgeResult_(true, 'GO', traceId, { attachment: clBridgeMapAttachmentFe_(rec) }, '', [], []);
}

function clBridgeMapLinkFe_(rec) {
  return {
    id: String(rec.LINK_ID || ''),
    checklistItemId: String(rec.CHECKLIST_ITEM_ID || ''),
    taskId: String(rec.TASK_ID || ''),
    label: String(rec.LABEL || ''),
    url: String(rec.URL || ''),
    type: String(rec.TYPE || '') || null,
    description: String(rec.DESCRIPTION || '') || null,
    source: String(rec.SOURCE || '') || null,
    createdBy: String(rec.CREATED_BY || '') || null,
    createdAt: String(rec.CREATED_AT || '') || null,
  };
}

function clBridgeReadLinks_(payload, traceId) {
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var taskId = String(payload.taskId || '').trim();
  var rows = clBridgeReadAllRows_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_LINKS).rows;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var rec = rows[i];
    if (checklistItemId && String(rec.CHECKLIST_ITEM_ID) !== checklistItemId) continue;
    if (taskId && String(rec.TASK_ID) !== taskId) continue;
    out.push(clBridgeMapLinkFe_(rec));
  }
  return clBridgeResult_(true, 'GO', traceId, { links: out }, '', [], []);
}

function clBridgeAppendLink_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var label = String(payload.label || '').trim();
  var url = String(payload.url || '').trim();
  if (!taskId || !checklistItemId || !label || !url) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId, checklistItemId, label, url required', [], []);
  }
  var linkId = String(payload.id || payload.linkId || '').trim() || taskDbMakeId_('CLL');
  var rec = {
    LINK_ID: linkId,
    CHECKLIST_ITEM_ID: checklistItemId,
    TASK_ID: taskId,
    LABEL: label,
    URL: url,
    TYPE: String(payload.type || ''),
    DESCRIPTION: String(payload.description || ''),
    SOURCE: String(payload.source || CL_BRIDGE_SOURCE_),
    CREATED_BY: String(payload.createdBy || clBridgeActorLabel_(actor)),
    CREATED_AT: String(payload.createdAt || clBridgeNowIso_()),
    SCHEMA_VERSION: CL_BRIDGE_SCHEMA_VERSION_,
  };
  var existing = clBridgeFindRowById_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_LINKS, 'LINK_ID', linkId);
  if (existing) {
    clBridgePatchRow_(existing, rec);
  } else {
    var append = clBridgeAppendRecord_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_LINKS, rec);
    if (!append.ok) {
      return clBridgeResult_(false, 'FAIL', traceId, null, append.error, [], [append.error]);
    }
  }
  clBridgeAppendHistory_(taskId, checklistItemId, 'link_persisted', label, rec.CREATED_BY, linkId, 'link', { url: url }, traceId);
  return clBridgeResult_(true, 'GO', traceId, { link: clBridgeMapLinkFe_(rec) }, '', [], []);
}

function clBridgeMapHistoryFe_(rec) {
  var meta = {};
  try {
    if (rec.METADATA_JSON) meta = JSON.parse(String(rec.METADATA_JSON));
  } catch (e) {}
  return {
    id: String(rec.HISTORY_ID || ''),
    checklistItemId: String(rec.CHECKLIST_ITEM_ID || ''),
    taskId: String(rec.TASK_ID || ''),
    type: String(rec.EVENT_TYPE || ''),
    message: String(rec.MESSAGE || ''),
    actor: String(rec.ACTOR || '') || null,
    createdAt: String(rec.CREATED_AT || '') || null,
    source: String(rec.SOURCE || '') || null,
    refId: String(rec.REF_ID || '') || null,
    refType: String(rec.REF_TYPE || '') || null,
    metadata: meta,
  };
}

function clBridgeReadHistory_(payload, traceId) {
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var taskId = String(payload.taskId || '').trim();
  var rows = clBridgeReadAllRows_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_HISTORY).rows;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var rec = rows[i];
    if (checklistItemId && String(rec.CHECKLIST_ITEM_ID) !== checklistItemId) continue;
    if (taskId && String(rec.TASK_ID) !== taskId) continue;
    out.push(clBridgeMapHistoryFe_(rec));
  }
  out.sort(function (a, b) {
    return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  });
  return clBridgeResult_(true, 'GO', traceId, { history: out }, '', [], []);
}

function clBridgeAppendHistoryEntry_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  var message = String(payload.message || '').trim();
  var eventType = String(payload.type || payload.eventType || 'manual_history_note_added').trim();
  if (!taskId || !checklistItemId || !message) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId, checklistItemId, message required', [], []);
  }
  var hist = clBridgeAppendHistory_(
    taskId,
    checklistItemId,
    eventType,
    message,
    String(payload.actor || clBridgeActorLabel_(actor)),
    String(payload.refId || ''),
    String(payload.refType || ''),
    payload.metadata || null,
    traceId,
  );
  if (!hist.ok) {
    return clBridgeResult_(false, 'FAIL', traceId, null, hist.error, [], [hist.error]);
  }
  return clBridgeResult_(true, 'GO', traceId, { entry: clBridgeMapHistoryFe_(hist.record) }, '', [], []);
}

function clBridgeReadTemplates_(traceId) {
  var templates = clBridgeReadAllRows_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_TEMPLATES).rows;
  var items = clBridgeReadAllRows_(CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_TEMPLATE_ITEMS).rows;
  var byTemplate = {};
  items.forEach(function (row) {
    var tid = String(row.TEMPLATE_ID || '');
    if (!tid) return;
    if (!byTemplate[tid]) byTemplate[tid] = [];
    byTemplate[tid].push({
      templateItemId: String(row.TEMPLATE_ITEM_ID || ''),
      templateId: tid,
      title: String(row.TITLE || ''),
      note: String(row.NOTE || ''),
      sortOrder: Number(row.SORT_ORDER) || 0,
      defaultStatus: String(row.DEFAULT_STATUS || 'open'),
      required: clBridgeIsTruthy_(row.REQUIRED),
      tagsJson: String(row.TAGS_JSON || ''),
    });
  });
  var out = templates
    .filter(function (t) {
      return clBridgeIsTruthy_(t.IS_ACTIVE) || String(t.IS_ACTIVE || '') === '';
    })
    .map(function (t) {
      var templateId = String(t.TEMPLATE_ID || '');
      return {
        templateId: templateId,
        name: String(t.NAME || ''),
        description: String(t.DESCRIPTION || ''),
        category: String(t.CATEGORY || ''),
        version: String(t.VERSION || ''),
        isActive: !t.IS_ACTIVE || clBridgeIsTruthy_(t.IS_ACTIVE),
        items: (byTemplate[templateId] || []).sort(function (a, b) {
          return a.sortOrder - b.sortOrder;
        }),
      };
    });
  return clBridgeResult_(true, 'GO', traceId, { templates: out }, '', [], []);
}

function clBridgeApplyTemplate_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var templateId = String(payload.templateId || '').trim();
  if (!taskId || !templateId) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId and templateId required', [], []);
  }
  var tplRes = clBridgeReadTemplates_(traceId);
  if (!tplRes.ok) return tplRes;
  var templates = (tplRes.data && tplRes.data.templates) || [];
  var tpl = null;
  for (var i = 0; i < templates.length; i++) {
    if (templates[i].templateId === templateId) {
      tpl = templates[i];
      break;
    }
  }
  if (!tpl || !tpl.items || !tpl.items.length) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Template not found or empty', [], ['Template not found']);
  }
  var created = [];
  var warnings = [];
  tpl.items.forEach(function (ti) {
    var createPayload = {
      taskId: taskId,
      title: ti.title,
      note: ti.note,
      sortOrder: ti.sortOrder,
      isRequired: ti.required,
      traceId: traceId,
    };
    var res = clBridgeUpsertChecklistItem_(createPayload, actor, traceId);
    if (res.ok && res.data && res.data.item) {
      created.push(res.data.item);
    } else {
      warnings.push('Skip item: ' + ti.title + ' — ' + (res.message || 'failed'));
    }
  });
  clBridgeAppendHistory_(
    taskId,
    '',
    'template_applied',
    'Áp dụng mẫu: ' + tpl.name,
    clBridgeActorLabel_(actor),
    templateId,
    'template',
    { createdCount: created.length },
    traceId,
  );
  return clBridgeResult_(true, warnings.length ? 'GO_WITH_WARNINGS' : 'GO', traceId, { created: created, templateId: templateId }, '', warnings, []);
}

function clBridgeEnsureItemDriveFolder_(payload, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  if (!taskId || !checklistItemId) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId and checklistItemId required', [], []);
  }
  if (typeof bootstrapChecklistDriveFolders !== 'function') {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'Drive bootstrap missing', [], ['bootstrapChecklistDriveFolders missing']);
  }
  var driveReport = bootstrapChecklistDriveFolders({ taskId: taskId, checklistItemId: checklistItemId });
  var itemFolder = driveReport.itemFolders && driveReport.itemFolders[0];
  if (!driveReport.ok && driveReport.status === 'FAIL') {
    return clBridgeResult_(false, 'FAIL', traceId, driveReport, driveReport.errors.join('; '), driveReport.warnings, driveReport.errors);
  }
  clBridgeAppendHistory_(
    taskId,
    checklistItemId,
    'drive_folder_ensured',
    'Đảm bảo thư mục Drive cho mục checklist',
    'SYSTEM',
    itemFolder && itemFolder.folderId,
    'drive',
    { driveUrl: itemFolder && itemFolder.driveUrl },
    traceId,
  );
  return clBridgeResult_(
    true,
    driveReport.status || 'GO',
    traceId,
    { drive: driveReport, itemFolder: itemFolder || null },
    '',
    driveReport.warnings || [],
    driveReport.errors || [],
  );
}

function clBridgeUpsertLayoutState_(payload, actor, traceId) {
  var taskId = String(payload.taskId || '').trim();
  var checklistItemId = String(payload.checklistItemId || '').trim();
  if (!taskId || !checklistItemId) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId and checklistItemId required', [], []);
  }
  var layoutStateId = String(payload.layoutStateId || '').trim() || taskDbMakeId_('CLY');
  var expanded = payload.expanded === true || String(payload.expanded).toLowerCase() === 'true';
  var rec = {
    LAYOUT_STATE_ID: layoutStateId,
    TASK_ID: taskId,
    CHECKLIST_ITEM_ID: checklistItemId,
    EXPANDED: expanded,
    LAST_OPENED_AT: String(payload.lastOpenedAt || clBridgeNowIso_()),
    UPDATED_AT: clBridgeNowIso_(),
    SOURCE: CL_BRIDGE_SOURCE_,
    SCHEMA_VERSION: CL_BRIDGE_SCHEMA_VERSION_,
  };
  var sheet = CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_LAYOUT_STATE;
  var existing = null;
  var rows = clBridgeReadAllRows_(sheet).rows;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].TASK_ID) === taskId && String(rows[i].CHECKLIST_ITEM_ID) === checklistItemId) {
      existing = { info: clBridgeReadAllRows_(sheet).info, record: rows[i], rowNumber: rows[i]._rowNumber };
      break;
    }
  }
  if (existing) {
    clBridgePatchRow_(existing, rec);
    layoutStateId = String(existing.record.LAYOUT_STATE_ID || layoutStateId);
  } else {
    var append = clBridgeAppendRecord_(sheet, rec);
    if (!append.ok) {
      return clBridgeResult_(false, 'FAIL', traceId, null, append.error, [], [append.error]);
    }
  }
  return clBridgeResult_(true, 'GO', traceId, {
    layoutStateId: layoutStateId,
    taskId: taskId,
    checklistItemId: checklistItemId,
    expanded: expanded,
  }, '', [], []);
}

function clBridgeMapLayoutFe_(rec) {
  return {
    layoutStateId: String(rec.LAYOUT_STATE_ID || ''),
    checklistItemId: String(rec.CHECKLIST_ITEM_ID || ''),
    taskId: String(rec.TASK_ID || ''),
    expanded: String(rec.EXPANDED).toLowerCase() === 'true' || rec.EXPANDED === true,
    lastOpenedAt: String(rec.LAST_OPENED_AT || '') || null,
    updatedAt: String(rec.UPDATED_AT || '') || null,
  };
}

function clBridgeReadLayoutState_(payload, traceId) {
  var taskId = String(payload.taskId || '').trim();
  if (!taskId) {
    return clBridgeResult_(false, 'FAIL', traceId, null, 'taskId is required', [], ['taskId is required']);
  }
  var sheet = CBV_TASK_DB_CONFIG.SHEETS.CHECKLIST_LAYOUT_STATE;
  var rows = clBridgeReadAllRows_(sheet).rows;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var rec = rows[i];
    if (String(rec.TASK_ID) !== taskId) continue;
    out.push(clBridgeMapLayoutFe_(rec));
  }
  return clBridgeResult_(true, 'GO', traceId, { layoutStates: out }, '', [], []);
}

/**
 * Dispatch bridge method (Worker entry).
 */
function clBridgeDispatch_(method, payload, actor, traceId) {
  method = String(method || '').trim();
  payload = payload || {};
  traceId = clBridgeTraceId_(payload, traceId);

  switch (method) {
    case 'readChecklistItems':
      return clBridgeReadChecklistItems_(String(payload.taskId || ''), traceId);
    case 'upsertChecklistItem':
      return clBridgeUpsertChecklistItem_(payload, actor, traceId);
    case 'readFeedback':
      return clBridgeReadFeedback_(payload, traceId);
    case 'appendFeedback':
      return clBridgeAppendFeedback_(payload, actor, traceId);
    case 'readAttachmentMetadata':
      return clBridgeReadAttachmentMetadata_(payload, traceId);
    case 'appendAttachmentMetadata':
      return clBridgeAppendAttachmentMetadata_(payload, actor, traceId);
    case 'readLinks':
      return clBridgeReadLinks_(payload, traceId);
    case 'appendLink':
      return clBridgeAppendLink_(payload, actor, traceId);
    case 'readHistory':
      return clBridgeReadHistory_(payload, traceId);
    case 'appendHistory':
      return clBridgeAppendHistoryEntry_(payload, actor, traceId);
    case 'readTemplates':
      return clBridgeReadTemplates_(traceId);
    case 'applyTemplate':
      return clBridgeApplyTemplate_(payload, actor, traceId);
    case 'ensureChecklistItemDriveFolder':
      return clBridgeEnsureItemDriveFolder_(payload, traceId);
    case 'upsertLayoutState':
      return clBridgeUpsertLayoutState_(payload, actor, traceId);
    case 'readLayoutState':
      return clBridgeReadLayoutState_(payload, traceId);
    case 'uploadChecklistFile':
      return clBridgeUploadChecklistFile_(payload, actor, traceId);
    default:
      return clBridgeResult_(false, 'FAIL', traceId, null, 'Unknown bridge method: ' + method, [], ['Unknown method']);
  }
}

/**
 * Validate Sheet/Drive bridge readiness (read-only + dry-run where safe).
 */
function validateChecklistSheetDriveBridge(options) {
  options = options || {};
  var traceId = clBridgeTraceId_(options, options.traceId);
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: clBridgeNowIso_(),
    traceId: traceId,
    sheet: { tabs: {}, schemaBootstrap: null },
    drive: { validate: null },
    bridge: { methods: [] },
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_14_MULTI_USER_SYNC',
  };

  if (typeof validateChecklistSheetSchema === 'function') {
    result.sheet.schemaBootstrap = validateChecklistSheetSchema(options);
    if (result.sheet.schemaBootstrap && !result.sheet.schemaBootstrap.ok) {
      result.warnings.push('Sheet schema validation reported issues');
    }
  }
  if (typeof validateChecklistDriveFolders === 'function') {
    result.drive.validate = validateChecklistDriveFolders(options);
    if (result.drive.validate && result.drive.validate.status === 'FAIL') {
      result.errors.push('Drive validation FAIL');
      result.ok = false;
    } else if (result.drive.validate && result.drive.validate.warnings && result.drive.validate.warnings.length) {
      result.warnings = result.warnings.concat(result.drive.validate.warnings);
    }
  }

  var methods = [
    'readChecklistItems',
    'appendFeedback',
    'appendHistory',
    'appendAttachmentMetadata',
    'ensureChecklistItemDriveFolder',
  ];
  result.bridge.methods = methods.map(function (m) {
    return { method: m, available: typeof clBridgeDispatch_ === 'function' };
  });

  var gas = typeof clBridgeDispatch_ === 'function';
  if (!gas) {
    result.ok = false;
    result.status = 'FAIL';
    result.errors.push('clBridgeDispatch_ missing');
  }

  if (result.errors.length) {
    result.status = 'FAIL';
    result.ok = false;
  } else if (result.warnings.length) {
    result.status = 'GO_WITH_WARNINGS';
  }

  return result;
}
