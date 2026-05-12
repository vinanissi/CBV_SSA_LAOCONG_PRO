/**
 * Phase 79 — Task detail + timeline service.
 */

function TASK_FE_Detail_open(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid) tid = TASK_FE_getActiveTaskId_();
  var t = HtmlService.createTemplateFromFile('79_TASK_FE_TASK_DETAIL');
  t.bootTaskId = JSON.stringify(tid);
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(980).setHeight(780), 'CBV TASK — Chi tiết & lịch sử');
}

/**
 * @param {string} taskId
 * @returns {{ ok: boolean, code: string, message: string, data: Object, errors: Array }}
 */
function TASK_FE_Timeline_get(taskId) {
  var tid = String(taskId || '').trim();
  if (!tid) return TASK_FE_response_(false, 'BAD_INPUT', 'Thiếu TASK_ID.', null, ['NO_ID']);
  var events = [];
  events = events.concat(TASK_FE_Timeline_fromUpdateLog_(tid));
  events = events.concat(TASK_FE_Timeline_fromOperational_(tid));
  events.sort(function (a, b) {
    return String(a.at || '').localeCompare(String(b.at || ''));
  });
  var files = TASK_FE_Timeline_attachments_(tid);
  return TASK_FE_response_(true, 'TASK_FE_TIMELINE_OK', 'OK', { taskId: tid, events: events, files: files }, []);
}

/**
 * @param {Object} event
 * @returns {{ ok: boolean, eventId?: string, warning?: string }}
 */
function TASK_FE_Timeline_appendEvent_(event) {
  var e = event || {};
  if (typeof CBV_OperationalTimeline_appendEvent_ === 'function') {
    return CBV_OperationalTimeline_appendEvent_({
      traceId: String(e.traceId || ''),
      eventType: String(e.eventType || 'TASK_FE'),
      actor: String(e.actor || ''),
      action: String(e.action || ''),
      objectType: 'TASK_MAIN',
      objectId: String(e.taskId || e.objectId || ''),
      metadata: e.metadata && typeof e.metadata === 'object' ? e.metadata : { note: String(e.note || '') },
      note: String(e.note || 'TASK_FE_APPEND_ONLY')
    });
  }
  return { ok: false, warning: 'OPERATIONAL_TIMELINE_UNAVAILABLE' };
}

/**
 * @param {string} taskId
 * @returns {Array<Object>}
 */
function TASK_FE_Timeline_fromUpdateLog_(taskId) {
  var sh = TASK_FE_getSheet_('TASK_UPDATE_LOG');
  if (!sh) return [];
  var rows = TASK_FE_sheetToObjects_(sh);
  var out = [];
  var i;
  for (i = 0; i < rows.length; i++) {
    if (String(rows[i].TASK_ID || '').trim() !== taskId) continue;
    if (String(rows[i].IS_DELETED) === 'true') continue;
    out.push({
      kind: 'LOG',
      at: rows[i].CREATED_AT instanceof Date ? rows[i].CREATED_AT.toISOString() : String(rows[i].CREATED_AT || ''),
      actor: String(rows[i].ACTOR_ID || rows[i].CREATED_BY || ''),
      action: String(rows[i].UPDATE_TYPE || '') + ' — ' + String(rows[i].ACTION || ''),
      note: String(rows[i].ACTION || '')
    });
  }
  return out;
}

/**
 * @param {string} taskId
 * @returns {Array<Object>}
 */
function TASK_FE_Timeline_fromOperational_(taskId) {
  var sh = TASK_FE_getSheet_('CBV_OPERATIONAL_TIMELINE');
  if (!sh) return [];
  var rows = TASK_FE_sheetToObjects_(sh);
  var out = [];
  var i;
  for (i = 0; i < rows.length; i++) {
    if (String(rows[i].OBJECT_ID || '').trim() !== taskId) continue;
    var meta = {};
    try {
      meta = JSON.parse(String(rows[i].METADATA_JSON || '{}'));
    } catch (e0) {
      meta = {};
    }
    out.push({
      kind: 'OPERATIONAL',
      at: String(rows[i].CREATED_AT || ''),
      actor: String(rows[i].ACTOR || ''),
      action: String(rows[i].EVENT_TYPE || '') + ' / ' + String(rows[i].ACTION || ''),
      note: String(rows[i].NOTE || '') + (meta && meta.note ? ' ' + meta.note : '')
    });
  }
  return out;
}

/**
 * @param {string} taskId
 * @returns {Array<Object>}
 */
function TASK_FE_Timeline_attachments_(taskId) {
  var sh = TASK_FE_getSheet_('TASK_ATTACHMENT');
  if (!sh) return [];
  var rows = TASK_FE_sheetToObjects_(sh);
  var out = [];
  var i;
  for (i = 0; i < rows.length; i++) {
    if (String(rows[i].TASK_ID || '').trim() !== taskId) continue;
    if (String(rows[i].IS_DELETED) === 'true') continue;
    out.push({
      id: String(rows[i].ID || ''),
      name: String(rows[i].FILE_NAME || rows[i].TITLE || 'Tệp'),
      url: String(rows[i].FILE_URL || rows[i].URL || '')
    });
  }
  return out;
}
